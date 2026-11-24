"use client";

import { useApp } from "./AppProvider";

export function Toast() {
  const { toastMsg, toastOn } = useApp();
  return <div className={"toast" + (toastOn ? " on" : "")} role="status">{toastMsg}</div>;
}
