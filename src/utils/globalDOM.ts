import { setLocalData } from ".";
import { _ACTIVE_CLASS, _ERROR_MESSAGE_TIMEOUT, _FLAG_ERROR_KEY } from "../constants";
import { DialogQSA, DialogQS, ErrorQS } from "./query";

export const setError = (message: string) => {
  ErrorQS(".error-message")!.innerHTML = message;
  ErrorQS()!.classList.add(_ACTIVE_CLASS);

  setTimeout(() => {
    removeError();
  }, _ERROR_MESSAGE_TIMEOUT);
};

export const removeError = () => {
  ErrorQS()!.classList.remove(_ACTIVE_CLASS);
  setLocalData(_FLAG_ERROR_KEY, false);
};

export const showDialog = (component: ContainerItemCategory) => {
  DialogQS()!.classList.add(_ACTIVE_CLASS);
  DialogQS(`.dialog-body [data-id=${component}]`)!.classList.add(_ACTIVE_CLASS);
};

export const closeDialog = () => {
  DialogQS()!.classList.remove(_ACTIVE_CLASS);
  DialogQSA(".dialog-body").forEach((dialogBody) => dialogBody.classList.remove(_ACTIVE_CLASS));
};

export type GetURLMessageType = {
  type: ChromeMessageTypeCategory;
  payload: { URL: string };
};

export const getTabURL = async () => {
  const type: ChromeMessageTypeCategory = "CHECK_URL";
  const URL = window.location.href;

  const message: GetURLMessageType = { type: type, payload: { URL } };

  await chrome.runtime
    .sendMessage(message)
    .then(() => console.info("MPC Extension -> Get URL success and send to the extension!"))
    .catch((err) => console.error(err));
};
