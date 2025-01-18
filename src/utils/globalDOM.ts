import { _ACTIVE_CLASS, _ERROR_MESSAGE_TIMEOUT, _FLAG_ERROR_KEY } from "../constants";
import { DialogQSA, DialogQS, ErrorQS } from "./query";

export const setError = (message: string) => {
  ErrorQS(".error-message")!.innerHTML = message;
  ErrorQS()!.classList.add(_ACTIVE_CLASS);

  setTimeout(() => {
    ErrorQS()!.classList.remove(_ACTIVE_CLASS);
  }, _ERROR_MESSAGE_TIMEOUT);
};

export const showDialog = (component: ContainerItemCategory) => {
  DialogQS()!.classList.add(_ACTIVE_CLASS);
  DialogQS(`.dialog-body ${component}`)!.classList.add(_ACTIVE_CLASS);
};

export const closeDialog = () => {
  DialogQS()!.classList.remove(_ACTIVE_CLASS);
  DialogQSA(".dialog-body").forEach((dialogBody) => dialogBody.classList.remove(_ACTIVE_CLASS));
};
