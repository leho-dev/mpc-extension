import { App } from "./app";
import { Info } from "./info";
import { Settings } from "./settings";
import { Statistics } from "./statistics";
import { _CURR_TAB_KEY, _ERROR_MESSAGE_TIMEOUT, _IGNORE_LIST_KEY } from "./constants";
import { _DEFAULT_COMPONENT, _DEFAULT_IGNORE_SUBJECT_DATA } from "./constants/default";
import { ContainerQS, ContainerQSA, DialogQS, NavQS, NavQSA } from "./utils/query";
import { closeDialog, removeError } from "./utils/globalDOM";
import { getLocalData, setLocalData } from "./utils";

type ComponentMappingType = Record<
  ContainerItemCategory,
  { render: () => void; unsubscribe: () => void; subscribe: () => void }
>;

(() => {
  const currTab = getLocalData(_CURR_TAB_KEY, _DEFAULT_COMPONENT) as ContainerItemCategory;

  const app = App();
  const info = Info();
  const statistics = Statistics();
  const settings = Settings();

  const componentMapping: ComponentMappingType = {
    app,
    info,
    settings,
    statistics
  };

  const navItems = NavQSA(".nav-item");
  const components = ContainerQSA("section");

  DialogQS()!.onclick = (e: Event) => {
    const target = e.target as HTMLElement;
    const isDialogBody = target.closest(".dialog-body");
    !isDialogBody && closeDialog();
  };

  DialogQS(".btn-close-dialog")!.onclick = closeDialog;

  navItems.forEach((navItem) => {
    navItem.onclick = (e: Event) => {
      const currItem = NavQS(".nav-item.active");
      if (currItem === e.target) return;

      navItems.forEach((navItem) => navItem.classList.remove("active"));
      components.forEach((component) => component.classList.remove("active"));

      const item = e.target as HTMLElement;
      item.classList.add("active");

      const componentId = item.dataset.id as ContainerItemCategory;
      const component = componentMapping[componentId];

      const currentComponent = componentMapping[currItem!.dataset.id as ContainerItemCategory];

      currentComponent.unsubscribe();
      removeError();
      ContainerQS("section#" + componentId)?.classList.add("active");
      setLocalData(_CURR_TAB_KEY, componentId);
      component.subscribe();
      component.render();
    };
  });

  const defaultSettings = () => {
    const hasIgnoreData = getLocalData(_IGNORE_LIST_KEY, []);
    if (!hasIgnoreData.length) {
      setLocalData(_IGNORE_LIST_KEY, {
        data: _DEFAULT_IGNORE_SUBJECT_DATA,
        updatedAt: new Date()
      });
    }
  };

  const defaultRender = () => {
    NavQS(".nav-item[data-id=" + currTab + "]")?.classList.add("active");
    ContainerQS("section#" + currTab)?.classList.add("active");
    componentMapping[currTab].subscribe();
    componentMapping[currTab].render();
  };

  return {
    start() {
      defaultSettings();
      defaultRender();
    }
  };
})().start();
