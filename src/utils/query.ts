const _$ = (selector: string): HTMLElement | null => document.querySelector(selector);
const _$$ = (selector: string): NodeListOf<HTMLElement> => document.querySelectorAll(selector);

const queryFromParentElement = (parent: ParentItemCategory, selector?: string | null): HTMLElement | null => {
  if (!selector) return _$(`${parent}`);
  return _$(`${parent} ${selector}`);
};
const queryAllFromParentElement = (parent: ParentItemCategory, selector?: string | null): NodeListOf<HTMLElement> => {
  if (!selector) return _$$(`${parent}`);
  return _$$(`${parent} ${selector}`);
};

const DialogQS = (selector?: string | null): HTMLElement | null => queryFromParentElement("#dialog", selector);
const DialogQSA = (selector?: string | null): NodeListOf<HTMLElement> => queryAllFromParentElement("#dialog", selector);

const NavQS = (selector?: string | null): HTMLElement | null => queryFromParentElement("#nav", selector);
const NavQSA = (selector?: string | null): NodeListOf<HTMLElement> => queryAllFromParentElement("#nav", selector);

const ErrorQS = (selector?: string | null): HTMLElement | null => queryFromParentElement("#error", selector);
const ErrorQSA = (selector?: string | null): NodeListOf<HTMLElement> => queryAllFromParentElement("#error", selector);

const ContainerQS = (selector?: string | null): HTMLElement | null => queryFromParentElement("#container", selector);
const ContainerQSA = (selector?: string | null): NodeListOf<HTMLElement> =>
  queryAllFromParentElement("#container", selector);

const FooterQS = (selector?: string | null): HTMLElement | null => queryFromParentElement("#footer", selector);
const FooterQSA = (selector?: string | null): NodeListOf<HTMLElement> => queryAllFromParentElement("#footer", selector);

export { DialogQS, DialogQSA, NavQS, NavQSA, ErrorQS, ErrorQSA, ContainerQS, ContainerQSA, FooterQS, FooterQSA };
