import { debounce, getCapybara, injectScriptActiveTab, removeVietnameseTones, setCapybara } from './utils.js';
import { _IGNORE_SUBJECT_DEFAULT, _URL_TIENICHSV } from './constant.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const getInitData = () => {
    const URL = window.location.href;
    let userId = 'NOT FOUND';
    let fullName = 'NOT FOUND';

    const loginElement = document.querySelectorAll('app-login table > tr');

    if (loginElement.length > 0) {
        userId = loginElement[0].querySelectorAll('td')[1].innerText.trim();
        fullName = loginElement[1].querySelectorAll('td')[1].innerText.trim();
    }

    (async () => {
        await chrome.runtime.sendMessage({
            type: 'INIT_URL',
            payload: { URL, userId, fullName }
        });
    })();
};

const getData = () => {
    const tableRows = document.querySelectorAll(
        'table#excel-table > tbody > tr.table-primary.ng-star-inserted, table#excel-table > tbody > tr.text-center.ng-star-inserted'
    );

    const data = [];

    Array.from(tableRows).forEach((row, index) => {
        const columns = row.querySelectorAll('td');

        const isHead = row.classList.contains('table-primary');

        if (isHead) {
            data.push({
                id: index,
                title: columns[0].innerText,
                data: []
            });
        }

        if (!isHead) {
            data[data.length - 1].data.push({
                code: columns[1].innerText,
                name: columns[3].innerText,
                credit: parseFloat(columns[4].innerText) || 0,
                point: parseFloat(columns[10].innerText)
            });
        }
    });

    (async () => {
        await chrome.runtime.sendMessage({ type: 'GET_DATA', payload: { data } });
    })();
};

(() => {
    const capybara = getCapybara();

    return {
        ignoreList: capybara.ignoreList,
        updatedAt: capybara.updatedAt,
        data: capybara.data,
        queyText: capybara.queyText,
        isOnlyCalcGPA: capybara.isOnlyCalcGPA,
        init() {
            injectScriptActiveTab(getInitData);
        },
        subscribe() {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                const { type, payload } = request;

                switch (type) {
                    case 'INIT_URL':
                        const { URL, userId, fullName } = payload;
                        if (!URL) {
                            $('.site-current').innerText = 'Lỗi không tìm thấy tab!';
                            return;
                        }

                        if (!URL.includes(_URL_TIENICHSV)) {
                            $('.site-current').innerHTML = 'Vui lòng chuyển sang tienichsv.ou.edu.vn/#/diem';
                            return;
                        }

                        $('.root').classList.remove('hide');
                        $('.btn-import-data').classList.remove('hide');
                        $('.site-current').innerText = userId + ' - ' + fullName;
                        return;

                    case 'GET_DATA':
                        const { data } = payload;

                        // Môn học trong danh sách ignore
                        // let dataFiltered = data.map((d) => {
                        //     const isIgnore = this.ignoreList.find((i) => d.code.includes(i));
                        //     if (isIgnore) return { ...d, isIgnore: true };
                        //     return d;
                        // });

                        // Lọc môn học trùng (học lại, học cải thiện)
                        // const map = {};
                        // dataFiltered.forEach((item) => {
                        //     if (item.isHead) continue;
                        //     const code = item.code;
                        //     if (!map[code] || parseFloat(item.point) > parseFloat(map[code].point)) {
                        //         map[code] = item;
                        //     }
                        // });

                        this.updateData(data);
                        return;
                    default:
                        console.log('No type match!');
                        return;
                }
            });
        },
        updateData(data) {
            this.data = data;
            setCapybara(data);
            this.checkIgnore();
            this.sortData();
            this.getTotal();
            this.render();
            this.updateTime();
        },
        checkIgnore() {
            this.data.forEach((d) => {
                d.data.forEach((item) => {
                    const isIgnore = this.ignoreList.find((i) => item.code.includes(i));
                    if (isIgnore) item.isIgnore = true;
                });
            });
        },
        sortData() {
            this.data.forEach((d) => {
                d.data.sort((a, b) => {
                    return a.isIgnore ? 1 : b.isIgnore ? -1 : 0;
                });
            });
        },
        getTotal() {
            this.data.forEach((d) => {
                const totalCredit = d.data.reduce((acc, curr) => {
                    if (curr.isHead) return acc;
                    if (curr.isIgnore) return acc;
                    return acc + parseInt(curr.credit);
                }, 0);

                const avg = d.data.reduce(
                    (acc, curr) => {
                        const point = parseFloat(curr.point);
                        const credit = parseInt(curr.credit);

                        if (curr.isIgnore || isNaN(point) || isNaN(credit)) return acc;
                        return {
                            point: acc.point + point * credit,
                            credit: acc.credit + credit
                        };
                    },
                    {
                        point: 0,
                        credit: 0
                    }
                );

                d.totalCredit = totalCredit;
                d.avgPoint = (avg.point / avg.credit).toFixed(3);
            });
        },
        updateTime() {
            this.updatedAt = new Date();
            $('#updatedAt').innerText = `(Cập nhật ${this.updatedAt.toLocaleString()})`;
        },
        render() {
            const tableHtmls = this.data
                .map((d, idx) => {
                    const data = d.data.map((row) => {
                        return `
                            <tr
                                class="row-data
                                ${row.isIgnore ? 'ignore' : ''}
                                ${row.isIgnore && this.isOnlyCalcGPA ? 'hide' : ''}
                                ${
                                    removeVietnameseTones(row.name.toLowerCase()).includes(this.queyText) ||
                                    this.queyText == ''
                                        ? ''
                                        : 'hide'
                                }"
                                ${row.isIgnore ? 'title="Môn học này không tính vào GPA trung bình"' : ''}
                            >
                                <td>${row.code}</td>
                                <td>${row.name}</td>
                                <td style="min-width: 20px;">${row.credit}</td>
                                <td style="min-width: 20px;">${row.point || ''}</td>
                                <td data-id=${idx} class="btn-delete" style="min-width: 20px;">x</td>
                            </tr>
                            `;
                    });

                    const dataHtmls = data.join('');

                    return `
                    <tr class="row-head">
                        <td colspan="5"><div>${d.title} <span>${d.totalCredit} - ${d.avgPoint}</span></div></td>
                    </tr>
                    ${dataHtmls}
                    `;
                })
                .join('');

            const ignoreListHtmls = this.ignoreList.map((ig) => `<b>${ig}</b>`).join('; ');

            const totalCredit = this.data.reduce((acc, curr) => {
                return acc + parseInt(curr.totalCredit);
            }, 0);

            const avgTotal = { point: 0, credit: 0 };
            this.data.forEach((item, ind) => {
                if (isNaN(item.avgPoint)) return;
                const avg = item.data.reduce(
                    (acc, curr) => {
                        const point = parseFloat(curr.point);
                        const credit = parseInt(curr.credit);

                        if (curr.isIgnore || isNaN(point) || isNaN(credit)) return acc;
                        return {
                            point: acc.point + point * credit,
                            credit: acc.credit + credit
                        };
                    },
                    {
                        point: 0,
                        credit: 0
                    }
                );

                avgTotal.point += avg.point;
                avgTotal.credit += avg.credit;
            });

            $('table.data').innerHTML = tableHtmls;
            $('.total-credit span').innerText = totalCredit;
            $('.avg-point span').innerText = (avgTotal.point / avgTotal.credit).toFixed(3);
        },
        handle() {
            $('.btn-import-data').addEventListener('click', () => injectScriptActiveTab(getData));

            $('#only-calc-gpa').onchange = (e) => {
                this.isOnlyCalcGPA = e.target.checked;
                this.render();
            };

            $('#search-subject').addEventListener(
                'input',
                debounce((e) => {
                    const value = e.target.value.trim().toLowerCase();
                    this.queyText = removeVietnameseTones(value);
                    this.render();
                }, 1000)
            );

            $('table.data').onclick = (e) => {
                const rowData = e.target.closest('.row-data');
                const deleteBtn = e.target.closest('.btn-delete');

                if (rowData) {
                    const id = rowData.dataset.id;
                    const { code, name, credit, point } = this.data[id];

                    $('input.code').value = code;
                    $('input.name').value = name;
                    $('input.credit').value = credit;
                    $('input.point').value = point;
                }

                if (deleteBtn) {
                    const id = deleteBtn.dataset.id;
                    this.data.splice(id, 1);
                    this.render();
                }
            };

            // $('.form-subject').onsubmit = (e) => {
            //     e.preventDefault();

            //     const code = $('input.code').value.trim();
            //     const name = $('input.name').value.trim();
            //     const credit = $('input.credit').value.trim();
            //     const point = $('input.point').value.trim();

            //     const data = { code, name, credit, point };

            //     const isExist = this.data.find((d) => d.code == code);

            //     if (!isExist) this.data.unshift(data);
            //     else {
            //         const idx = this.data.findIndex((d) => d.code === code);
            //         this.data[idx] = data;
            //     }

            //     this.render();
            // };
        },
        start() {
            this.subscribe();
            this.init();
            this.handle();
            this.render();
        }
    };
})().start();
