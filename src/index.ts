import { App } from "./app";
import { Info } from "./info";
import { Statistics } from "./statistics";
import { _ACTIVE_CLASS, _CURR_TAB_KEY, _ERROR_MESSAGE_TIMEOUT, _IGNORE_LIST_KEY } from "./constants";
import { _DEFAULT_COMPONENT, _DEFAULT_IGNORE_SUBJECT_DATA } from "./constants/default";
import { ContainerQS, ContainerQSA, DialogQS, NavQS, NavQSA } from "./utils/query";
import { closeDialog, removeError } from "./utils/globalDOM";
import { getLocalData, setLocalData } from "./utils";

type ComponentMappingType = Record<ContainerItemCategory, { onUnmount: () => void; onMount: () => void }>;

(() => {
  const currTab = getLocalData(_CURR_TAB_KEY, _DEFAULT_COMPONENT) as ContainerItemCategory;

  const app = App();
  const info = Info();
  const statistics = Statistics();

  const componentMapping: ComponentMappingType = {
    app,
    info,
    statistics
  };

  const navItems = NavQSA(".nav-item");
  const components = ContainerQSA("section");
  const redirectLinksE = ContainerQSA(".redirect-link");

  DialogQS()!.onclick = (e: Event) => {
    const target = e.target as HTMLElement;
    const isDialogBody = target.closest(".dialog-body");
    !isDialogBody && closeDialog();
  };
  DialogQS(".btn-close-dialog")!.onclick = closeDialog;

  const eventHandlers = () => {
    redirectLinksE.forEach((redirectLink) => {
      redirectLink.onclick = (e: Event) => {
        const target = e.target as HTMLElement;
        const url = target.dataset.url as string;
        chrome.tabs.update({ url });
      };
    });

    navItems.forEach((navItem) => {
      navItem.onclick = (e: Event) => {
        const itemActiveCurr = NavQS(".nav-item.active");
        const itemCurr = e.target as HTMLElement;
        if (itemActiveCurr === itemCurr) return;

        navItems.forEach((navItem) => navItem.classList.remove(_ACTIVE_CLASS));
        components.forEach((component) => component.classList.remove(_ACTIVE_CLASS));

        itemCurr.classList.add(_ACTIVE_CLASS);

        const newComponentId = itemCurr.dataset.id as ContainerItemCategory;
        const oldComponentId = itemActiveCurr!.dataset.id as ContainerItemCategory;

        removeOldComponent(oldComponentId);
        initNewComponent(newComponentId);
      };
    });

    const removeOldComponent = (componentId: ContainerItemCategory) => {
      const oldComponent = componentMapping[componentId];
      oldComponent.onUnmount();
      removeError();
    };

    const initNewComponent = (componentId: ContainerItemCategory) => {
      ContainerQS("section#" + componentId)?.classList.add(_ACTIVE_CLASS);
      setLocalData(_CURR_TAB_KEY, componentId);
      const newComponent = componentMapping[componentId];
      newComponent.onMount();
    };
  };

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
    NavQS(".nav-item[data-id=" + currTab + "]")?.classList.add(_ACTIVE_CLASS);
    ContainerQS("section#" + currTab)?.classList.add(_ACTIVE_CLASS);
    componentMapping[currTab].onMount();
  };

  return {
    start() {
      eventHandlers();
      defaultSettings();
      defaultRender();
    }
  };
})().start();
