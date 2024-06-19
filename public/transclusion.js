"use strict";

document.addEventListener("submit", async (event) => {
	let form = event.target;
	if (!(form instanceof HTMLFormElement)) return;
	if (!form.hasAttribute("data-boost")) return;
	let { confirm, target, select, swap, reset, history, delay } = config(form);

	// Submit the form ourselves
	event.preventDefault();
	if (confirm && window.confirm(confirm) === false) return;
	let res = await submit(form, event.submitter, history);

	// Find existing element to update
	/** @type {HTMLElement | null} */
	let replacee = document.body;
	if (target === "this") replacee = form;
	else if (target?.startsWith("closest"))
		replacee = form.closest(target.replace("closest ", ""));
	else if (target) replacee = document.querySelector(target);
	if (replacee === null) throw new Error(`target ${target} not found`);

	// Find new element to use from response
	let dom = new DOMParser().parseFromString(await res.text(), "text/html");
	let replacer = select ? dom.querySelector(select) : dom.body;
	if (replacer === null) throw new Error(`select ${target} not found`);

	replacee.setAttribute("data-swapping", "");
	if (delay) await wait(delay);
	replacee.removeAttribute("data-swapping");

	// Update the page
	if (swap === "delete") replacee.remove();
	if (swap === "prepend") replacee.prepend(replacer);
	if (swap === "append") replacee.append(replacer);
	if (swap === "outerHTML") replacee.replaceWith(replacer);
	if (swap === "innerHTML") replacee.replaceChildren(...replacer.childNodes);

	// Reset the form
	if (reset) form.reset();
});

/**
@param {HTMLFormElement} form
@returns {{
  reset: boolean;
  target: string | undefined;
  select: string | undefined;
  swap: "delete" | "prepend" | "append" | "outerHTML" | "innerHTML";
	history: "push" | "replace" | "none";
	delay: number;
	confirm: string | undefined;
}}
*/

function config(form) {
	let reset = form.hasAttribute("data-reset") ?? true;
	let delay = Number(form.dataset.delay ?? 0);
	if (Number.isNaN(delay)) {
		throw new TypeError(`data-delay="${form.dataset.delay}" is not valid`);
	}
	let {
		select,
		target,
		swap = "innerHTML",
		history = "push",
		confirm,
	} = form.dataset;
	if (
		swap !== "delete" &&
		swap !== "prepend" &&
		swap !== "append" &&
		swap !== "outerHTML" &&
		swap !== "innerHTML"
	) {
		throw new TypeError(`data-swap="${swap}" is not valid`);
	}
	if (history !== "push" && history !== "replace" && history !== "none") {
		throw new TypeError(`data-history="${history}" is not valid`);
	}
	return { reset, target, select, swap, history, delay, confirm };
}

/**
@param {HTMLFormElement} form
@param {HTMLElement | null} submitter
@param {"push" | "replace" | "none"} history
@returns {Promise<Response>}
*/
function submit(form, submitter, history) {
	let { action, method } = form;
	if (
		submitter instanceof HTMLInputElement ||
		submitter instanceof HTMLButtonElement
	) {
		action ||= submitter.formAction;
		method ||= submitter.formMethod;
	}
	let headers = { "content-type": "application/x-www-form-urlencoded" };
	let values = urlencoded(new FormData(form, submitter));
	/** @type {RequestInit} */
	let options = { method, headers };
	if (method === "get") {
		let url = new URL(action);
		url.search = values.toString();
		action = url.toString();
		switch (history) {
			case "push":
				window.history.pushState(null, "", action);
				break;
			case "replace":
				window.history.replaceState(null, "", action);
				break;
		}
	}
	if (method === "post") {
		options.body = values;
	}
	return fetch(action, options);
}

/** @param {FormData} data */
function urlencoded(data) {
	let pairs = [];
	for (let [key, val] of data) {
		if (typeof val === "string") pairs.push([key, val]);
		else pairs.push([key, val.name]);
	}
	return new URLSearchParams(pairs);
}

/** @param {number} ms */
let wait = (ms) => new Promise((r) => setTimeout(r, ms));
