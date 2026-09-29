const products = [
  { id: 1, name: "American Government Institutions and Policies, 16th Updated Edition AP Edition", seats: "124 of 251 Available", used: "127 Used", courseCount: 28, associationCount: 4, associatedCourseCount: 8 },
  { id: 2, name: "American Government: Institutions & Policies, AP® Edition", seats: "-50 of 250 Available", used: "300 Used", negative: true, courseCount: 54, associationCount: 5, associatedCourseCount: 8 },
  { id: 3, name: "American Pageant", seats: "0 of 250 Available", used: "300 Used", courseCount: 42, associationCount: 3, associatedCourseCount: 0 },
  { id: 4, name: "An Introduction to Comparative Politics, AP® Edition, Student Edition", seats: "50 of 250 Available", used: "200 Used", courseCount: 14, associationCount: 2, associatedCourseCount: 0 },
  { id: 5, name: "Century 21 Accounting: General Journal", seats: "50 of 250 Available", used: "150 Used", courseCount: 24, associationCount: 4, associatedCourseCount: 8 },
  { id: 6, name: "Environmental Science", seats: "50 of 250 Available", used: "150 Used", courseCount: 24, associationCount: 4, associatedCourseCount: 8 }
];

const baseCourses = ["Biology", "AP Biology", "AP Biology Period A", "AP Biology Period B", "Advanced Cellular Biology", "Molecular Biology - Block A", "Ecology and Environmental Science - Block A", "Biochemistry and Biotechnology - Block B"];
const state = {
  screen: "products", selectedProduct: products[0], expandedProductId: null,
  expandedAssociationIds: new Set(), selected: new Set(), courses: [...baseCourses],
  detached: new Set(), inactiveCourses: new Set(),
  associations: [
    { id: 1, type: "Code", courseNames: baseCourses.slice(0, 4), level: "Course", value: "9954" },
    { id: 2, type: "Code", courseNames: baseCourses.slice(4, 6), level: "Course", value: "9954" },
    { id: 3, type: "Code", courseNames: baseCourses.slice(6, 8), level: "Course", value: "9954" },
    { id: 4, type: "Code", courseNames: [], level: "Course", value: "9954" }
  ],
  productQuery: "", associationQuery: "", courseQuery: "", hideInactiveProducts: false,
  refreshedAt: "9/28/2026 1:40:34 PM", modal: null
};

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const toastRoot = document.querySelector("#toast-root");
const asset = (name, alt = "", className = "") => `<img src="./assets/figma/${name}" alt="${alt}" class="${className}">`;
const headerCell = label => `<th><span class="th-label">${label}</span><span class="sort" aria-hidden="true"></span></th>`;
const associationSummary = product => product.associatedCourseCount ? `${product.associationCount} associations for ${product.associatedCourseCount} courses` : `${product.associationCount} associations`;

function shell(content) {
  return `<header class="topbar"><div class="menu-brand"><button class="menu-button" aria-label="Open navigation">${asset("nav-toggle.svg")}</button><div class="brand">${asset("cengage-school-logo.png", "Cengage School", "brand-logo")}</div></div><div class="account"><span class="avatar">${asset("account.svg", "", "account-icon")}</span><span>Welcome, Janine Teagues</span></div></header><main class="main"><h1>Ann Arbor Pub School District</h1>${content}<footer class="footer"><a href="#">Cookies</a><a href="#">Privacy</a></footer></main>`;
}
function mainTabs() {
  return `<div class="tabs main-tabs" role="tablist">${["Details", "Schools", "Provisioning", "Entitlements", "Contacts & admins", "Configuration", "Standard sets"].map(label => `<button class="tab ${label === "Entitlements" ? "active" : ""}" role="tab" aria-selected="${label === "Entitlements"}">${label}</button>`).join("")}</div>`;
}
function secondaryTabs() {
  return `<div class="secondary-row"><div class="tabs secondary-tabs"><button class="tab active">Entitlement records</button><button class="tab">Products available</button></div><div class="seat-update"><span>Seat counts last updated: ${state.refreshedAt}</span><button class="refresh-button" data-action="refresh-seats" aria-label="Refresh seat counts">${asset("nav-sync.svg")}</button></div></div>`;
}
const entriesControl = () => `<label class="entries-control"><span>Entries</span><select aria-label="Entries per page"><option>10</option><option>25</option></select></label>`;
const searchControl = (action, placeholder, value) => `<div class="search-wrap"><input data-action="${action}" aria-label="${placeholder}" placeholder="${placeholder}" value="${value}"></div>`;

function productScreen() {
  const visible = products.filter(product => product.name.toLowerCase().includes(state.productQuery.toLowerCase()));
  return shell(`${mainTabs()}${secondaryTabs()}<section class="table-section"><div class="action-row"><label class="checkbox-label"><input class="check" type="checkbox" data-action="hide-inactive" ${state.hideInactiveProducts ? "checked" : ""}>Hide inactive products</label><div class="action-row-buttons"><button class="btn btn-primary" data-action="add-entitlement">Add entitlement</button><button class="btn" disabled>Deactivate</button><button class="btn">Download ${asset("arrow-drop-down.svg", "", "button-chevron")}</button></div></div><div class="control-row">${entriesControl()}${searchControl("product-search", "Search products...", state.productQuery)}</div><div class="table-card product-table"><table aria-label="Products"><colgroup><col style="width:28.57%"><col style="width:12.67%"><col style="width:16.13%"><col style="width:10.75%"><col style="width:12.67%"><col style="width:19.2%"></colgroup><thead><tr>${["Product name", "Platform", "Seats", "Status", "All courses", "OneRoster associations"].map(headerCell).join("")}</tr></thead><tbody>${visible.map(productRow).join("") || `<tr><td colspan="6" class="empty">No products match your search.</td></tr>`}</tbody></table></div>${paginationFooter()}</section>`);
}
function productRow(product) {
  const open = state.expandedProductId === product.id;
  return `<tr><td><button class="disclosure" data-action="expand-product" data-product="${product.id}" aria-expanded="${open}">${asset("row-chevron.svg", "", `row-chevron-icon ${open ? "open" : ""}`)}</button><span class="product-name">${product.name}</span></td><td>Mindtap</td><td><span class="${product.negative ? "negative" : ""}">${product.seats}</span><br>(${product.used})</td><td><span class="tag">Active</span></td><td><button class="row-trigger" data-action="courses" data-product="${product.id}">${product.courseCount}</button></td><td><button class="row-trigger association-summary" data-action="associations" data-product="${product.id}">${associationSummary(product)}</button><button class="round-action" data-action="add" data-product="${product.id}" aria-label="Add association for ${product.name}">${asset("add-circle.svg")}</button></td></tr>${open ? entitlementRows(product) : ""}`;
}
function entitlementRows(product) {
  const rows = [1, 2, 3].map(() => `<tr><td>${asset("edit.svg")}</td><td><span class="teal-icon">▣</span></td><td><span class="product-name">${product.name}</span></td><td>9780170481151</td><td>Pre-PO<br>faculty setup</td><td>0</td><td>5/28/2025</td><td>5/31/2025</td><td>1</td><td><span class="tag">Active</span></td><td><span class="teal-icon">▤</span></td><td><input class="check" type="checkbox" aria-label="Select entitlement"></td></tr>`).join("");
  return `<tr class="nested-row"><td colspan="6" class="entitlement-wrap"><div class="nested-table"><table aria-label="Entitlements for ${product.name}"><colgroup><col style="width:3%"><col style="width:3%"><col style="width:21%"><col style="width:10%"><col style="width:14%"><col style="width:8%"><col style="width:9%"><col style="width:9%"><col style="width:8%"><col style="width:8%"><col style="width:3%"><col style="width:4%"></colgroup><thead><tr><th></th><th></th>${["Entitlement name", "ISBN", "Type", "Seats", "Activation", "Expiration", "Opty ID", "Status"].map(headerCell).join("")}<th></th><th></th></tr></thead><tbody>${rows}</tbody></table></div></td></tr>`;
}
const detailHeading = label => `<div class="detail-title"><button class="back-btn" data-action="products" aria-label="Back to entitlements">${asset("back.svg")}</button><p><strong>${label}:</strong> ${state.selectedProduct.name}</p></div>`;
const coursesForAssociation = item => item.courseNames.filter(name => state.courses.includes(name));
function updateAssociationCounts() {
  state.associations.forEach(item => { item.courseNames = item.courseNames.filter(name => state.courses.includes(name)); });
  state.selectedProduct.associatedCourseCount = new Set(state.associations.flatMap(item => item.courseNames)).size;
}
function associationRows() {
  return state.associations.filter(item => `${item.level} ${item.type} ${item.value}`.toLowerCase().includes(state.associationQuery.toLowerCase())).map(item => {
    const courses = coursesForAssociation(item);
    const open = state.expandedAssociationIds.has(item.id) && courses.length;
    return `<tr><td>${item.level}</td><td>${item.type}</td><td>${item.value}</td><td>${courses.length ? `<button class="row-trigger association-toggle" data-action="expand" data-id="${item.id}" aria-expanded="${Boolean(open)}">${asset("row-chevron.svg", "", `row-chevron-icon ${open ? "open" : ""}`)}${courses.length}</button>` : "0"}</td><td><div class="action-buttons"><button class="icon-action" data-action="edit" data-id="${item.id}" aria-label="Edit association">${asset("edit.svg")}</button><button class="icon-action" data-action="delete-association" data-id="${item.id}" aria-label="Delete association">${asset("delete.svg")}</button></div></td></tr>${open ? childCourseRow(item, courses) : ""}`;
  }).join("");
}
function childCourseRow(item, courses) {
  const allSelected = courses.every(name => state.selected.has(name));
  return `<tr class="nested-row"><td colspan="5" class="child-wrap"><div class="child-table"><table aria-label="Courses in association ${item.id}"><colgroup><col style="width:19%"><col style="width:11%"><col style="width:12%"><col style="width:12%"><col style="width:11%"><col style="width:11%"><col style="width:11%"><col style="width:9%"><col style="width:4%"></colgroup><thead><tr>${["Course", "Key", "Teacher", "School", "ISBN (IAC)", "Dates", "Created", "Status"].map(headerCell).join("")}<th><input class="check" type="checkbox" data-action="select-all" data-association="${item.id}" aria-label="Select all courses" ${allSelected ? "checked" : ""}></th></tr></thead><tbody>${courses.map(name => courseRow(name, false)).join("")}</tbody></table></div></td></tr>`;
}
function courseRow(name, includeProvisioning) {
  const inactive = state.inactiveCourses.has(name);
  return `<tr><td>${name}</td><td><span class="ellipsis">E-XT9W8M5WN...</span></td><td><span class="ellipsis">christopher.obrien@cengage.com</span></td><td>Berkmar High School</td>${includeProvisioning ? `<td>${state.courses.indexOf(name) < 6 ? "OneRoster" : "Self registered"}</td>` : ""}<td>9781337400572</td><td>2026.08.03 - 2027.01.04</td><td>2026.08.03</td><td><span class="tag ${inactive ? "tag-inactive" : ""}">${inactive ? "Inactive" : "Active"}</span></td><td><input class="check" type="checkbox" data-action="select-course" data-course="${name}" aria-label="Select ${name}" ${state.selected.has(name) ? "checked" : ""}></td></tr>`;
}
function associationsScreen() {
  updateAssociationCounts();
  return shell(`${detailHeading(`${state.selectedProduct.associationCount} associations for ${state.selectedProduct.associatedCourseCount} courses`)}<section class="table-section"><div class="action-row"><div class="filter-row"><select class="filter-select" aria-label="Association type"><option>Association type</option><option>Code</option></select><select class="filter-select compact" aria-label="Level"><option>Level</option><option>Course</option></select></div><button class="btn" data-action="add">Add OneRoster association</button></div><div class="control-row">${entriesControl()}${searchControl("association-search", "Search associations...", state.associationQuery)}</div><div class="table-card"><table aria-label="Associations"><colgroup><col style="width:22%"><col style="width:22%"><col style="width:22%"><col style="width:22%"><col style="width:12%"></colgroup><thead><tr>${["Association level", "Type", "Value", "Courses", "Actions"].map(headerCell).join("")}</tr></thead><tbody>${associationRows()}</tbody></table></div>${paginationFooter()}${state.selected.size ? bulkBar("associations") : ""}</section>`);
}
function coursesScreen() {
  const visible = state.courses.filter(name => name.toLowerCase().includes(state.courseQuery.toLowerCase()));
  const allSelected = visible.length > 0 && visible.every(name => state.selected.has(name));
  return shell(`${detailHeading(`${state.selectedProduct.courseCount} courses`)}<section class="table-section"><div class="control-row">${entriesControl()}${searchControl("course-search", "Search courses...", state.courseQuery)}</div><div class="table-card"><table aria-label="All courses"><colgroup><col style="width:19.4%"><col style="width:9.7%"><col style="width:9.7%"><col style="width:9.7%"><col style="width:9.7%"><col style="width:9.7%"><col style="width:9.7%"><col style="width:9.7%"><col style="width:8.9%"><col style="width:3.6%"></colgroup><thead><tr>${["Course", "Key", "Teacher", "School", "Provisioning method", "ISBN (IAC)", "Dates", "Created", "Status"].map(headerCell).join("")}<th><input class="check" type="checkbox" data-action="select-all-courses" aria-label="Select all listed courses" ${allSelected ? "checked" : ""}></th></tr></thead><tbody>${visible.map(name => courseRow(name, true)).join("")}</tbody></table></div>${paginationFooter()}${state.selected.size ? bulkBar("courses") : ""}</section>`);
}
function paginationFooter() {
  return `<div class="pagination-row"><strong>Showing 1 to 10 of 100 entries</strong><div class="pagination" aria-label="Pagination"><button class="page" aria-label="Previous page">←</button>${[1,2,3,4,5,6,7,8,9,10].map(n => `<button class="page ${n === 1 ? "active" : ""}">${n}</button>`).join("")}<button class="page" aria-label="Next page">→</button></div></div>`;
}
function bulkBar(mode) {
  const word = state.selected.size === 1 ? "course" : "courses";
  return `<div class="bulkbar"><span>${state.selected.size} ${word} selected</span><div class="bulk-actions"><button class="deselect" data-action="deselect">Deselect all</button>${mode === "courses" ? `<button class="btn btn-sm" data-action="deactivate-courses">Deactivate courses</button>` : `<button class="btn btn-sm" data-action="detach">Remove from OneRoster management</button>`}<button class="btn btn-sm" data-action="delete-courses">Delete courses</button></div></div>`;
}
function render() {
  app.innerHTML = state.screen === "products" ? productScreen() : state.screen === "courses" ? coursesScreen() : associationsScreen();
  document.title = `Cengage School · ${state.screen === "products" ? "District entitlements" : state.screen === "courses" ? "Courses" : "Associations"}`;
  renderModal();
}
function modalFrame(title, body, actions, extraClass = "") {
  return `<div class="modal-backdrop" data-action="backdrop"><section class="modal ${extraClass}" role="dialog" aria-modal="true"><div class="modal-head"><h2>${title}</h2><button class="modal-close" data-action="close-modal" aria-label="Close dialog">${asset("close.svg")}</button></div>${body}${actions}</section></div>`;
}
function formModal(editing) {
  const body = `<form data-action="association-form"><div class="modal-body"><p>${editing ? "Edit your" : "Add an"} association for your <strong>${state.selectedProduct.name}</strong> product.</p><label class="field"><span>Association level</span><select name="level"><option value="">Select level</option><option value="Course" ${editing ? "selected" : ""}>Course</option><option value="School">School</option></select></label><label class="field"><span>Association type</span><select name="type" ${editing ? "" : "disabled"}><option value="">Select type</option><option value="Code" ${editing ? "selected" : ""}>Code</option><option value="Name">Name</option></select></label><label class="field"><span>Association value</span><input name="value" placeholder="Enter value" value="${editing ? state.modal.item.value : ""}"></label></div><div class="modal-actions"><button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">${editing ? "Save" : "Submit"}</button></div></form>`;
  return modalFrame(`${editing ? "Edit" : "Add"} OneRoster association`, body, "");
}
function confirmationModal(type) {
  const count = state.selected.size;
  const config = {
    detach: ["Remove from OneRoster management", `Are you sure you want to remove ${count} courses from OneRoster management?`, "The link between OneRoster and these courses will be broken and they’ll no longer be able to be updated via OneRoster. This action cannot be undone.", "Yes, remove"],
    "delete-courses": ["Delete courses", `Are you sure you want to delete ${count} courses?`, "The courses and all of their information will be deleted. This action cannot be undone.", "Yes, delete"],
    "deactivate-courses": ["Deactivate courses", `Are you sure you want to deactivate ${count} courses?`, "", "Yes, deactivate"]
  }[type];
  const body = `<div class="modal-body"><p>${config[1]}</p>${config[2] ? `<div class="notice"><span class="info-icon">i</span><span>${config[2]}</span></div>` : ""}</div>`;
  const actions = `<div class="modal-actions"><button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="confirm-bulk">${config[3]}</button></div>`;
  return modalFrame(config[0], body, actions, "confirm-modal");
}
function deleteAssociationModal() {
  const count = coursesForAssociation(state.modal.item).length;
  const choice = state.modal.choice;
  const body = `<div class="modal-body"><p>${count ? `There are ${count} courses within your association. Before you delete your association, please determine what you’d like to do with your courses.` : "Are you sure you want to delete this association?"}</p>${count ? `<label class="radio-label"><input type="radio" name="association-delete-choice" value="detach" ${choice === "detach" ? "checked" : ""}>Remove from OneRoster management</label><label class="radio-label"><input type="radio" name="association-delete-choice" value="delete" ${choice === "delete" ? "checked" : ""}>Delete courses</label>${choice === "delete" ? `<div class="notice"><span class="info-icon">i</span><span>The courses and all of their information will be deleted. This action cannot be undone.</span></div>` : ""}` : ""}</div>`;
  const actions = `<div class="modal-actions"><button class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="confirm-delete-association" ${count && !choice ? "disabled" : ""}>Confirm</button></div>`;
  return modalFrame("Delete association", body, actions, "confirm-modal");
}
function renderModal() {
  if (!state.modal) { modalRoot.innerHTML = ""; return; }
  if (state.modal.type === "add" || state.modal.type === "edit") modalRoot.innerHTML = formModal(state.modal.type === "edit");
  else if (state.modal.type === "delete-association") modalRoot.innerHTML = deleteAssociationModal();
  else modalRoot.innerHTML = confirmationModal(state.modal.type);
}
function toast(message) {
  toastRoot.innerHTML = `<div class="toast">${message}</div>`;
  window.setTimeout(() => { toastRoot.innerHTML = ""; }, 2600);
}
function selectProductFrom(target) {
  const product = products.find(item => item.id === Number(target.dataset.product));
  if (product) state.selectedProduct = product;
}
function deleteSelectedCourses() {
  const deleted = new Set(state.selected);
  state.courses = state.courses.filter(name => !deleted.has(name));
  state.selectedProduct.courseCount = Math.max(0, state.selectedProduct.courseCount - deleted.size);
  state.associations.forEach(item => { item.courseNames = item.courseNames.filter(name => !deleted.has(name)); if (!item.courseNames.length) state.expandedAssociationIds.delete(item.id); });
  deleted.forEach(name => state.inactiveCourses.delete(name));
  updateAssociationCounts();
}

app.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (["product-search", "association-search", "course-search", "select-all", "select-all-courses", "select-course", "hide-inactive"].includes(action)) return;
  if (["courses", "associations", "add"].includes(action)) selectProductFrom(target);
  if (action === "products") { state.screen = "products"; state.expandedAssociationIds.clear(); state.selected.clear(); }
  if (action === "associations") { state.screen = "associations"; state.selected.clear(); }
  if (action === "courses") { state.screen = "courses"; state.selected.clear(); }
  if (action === "expand-product") { selectProductFrom(target); state.expandedProductId = state.expandedProductId === Number(target.dataset.product) ? null : Number(target.dataset.product); }
  if (action === "expand") {
    const id = Number(target.dataset.id);
    if (state.expandedAssociationIds.has(id)) { state.expandedAssociationIds.delete(id); const item = state.associations.find(entry => entry.id === id); coursesForAssociation(item).forEach(name => state.selected.delete(name)); }
    else state.expandedAssociationIds.add(id);
  }
  if (action === "add") state.modal = { type: "add" };
  if (action === "edit") state.modal = { type: "edit", item: state.associations.find(item => item.id === Number(target.dataset.id)) };
  if (action === "delete-association") state.modal = { type: "delete-association", item: state.associations.find(item => item.id === Number(target.dataset.id)), choice: null };
  if (action === "deselect") state.selected.clear();
  if (action === "detach") state.modal = { type: "detach" };
  if (action === "deactivate-courses") state.modal = { type: "deactivate-courses" };
  if (action === "delete-courses") state.modal = { type: "delete-courses" };
  if (action === "refresh-seats") { state.refreshedAt = new Date().toLocaleString("en-US"); toast("Seat counts updated"); }
  if (action === "add-entitlement") toast("Add entitlement selected");
  render();
});
app.addEventListener("input", event => {
  const action = event.target.dataset.action;
  if (action === "product-search") state.productQuery = event.target.value;
  if (action === "association-search") state.associationQuery = event.target.value;
  if (action === "course-search") state.courseQuery = event.target.value;
  if (["product-search", "association-search", "course-search"].includes(action)) {
    const position = event.target.selectionStart; render();
    const replacement = document.querySelector(`[data-action="${action}"]`);
    replacement.focus(); replacement.setSelectionRange(position, position);
  }
});
app.addEventListener("change", event => {
  const action = event.target.dataset.action;
  if (action === "hide-inactive") { state.hideInactiveProducts = event.target.checked; render(); }
  if (action === "select-all") { const item = state.associations.find(entry => entry.id === Number(event.target.dataset.association)); coursesForAssociation(item).forEach(name => event.target.checked ? state.selected.add(name) : state.selected.delete(name)); render(); }
  if (action === "select-all-courses") { state.courses.filter(name => name.toLowerCase().includes(state.courseQuery.toLowerCase())).forEach(name => event.target.checked ? state.selected.add(name) : state.selected.delete(name)); render(); }
  if (action === "select-course") { event.target.checked ? state.selected.add(event.target.dataset.course) : state.selected.delete(event.target.dataset.course); render(); }
});
modalRoot.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "close-modal" || (action === "backdrop" && event.target === target)) { state.modal = null; renderModal(); return; }
  if (action === "confirm-bulk") {
    const type = state.modal.type, count = state.selected.size;
    if (type === "delete-courses") deleteSelectedCourses();
    if (type === "detach") state.selected.forEach(name => state.detached.add(name));
    if (type === "deactivate-courses") state.selected.forEach(name => state.inactiveCourses.add(name));
    toast(`${count} ${count === 1 ? "course" : "courses"} ${type === "delete-courses" ? "deleted" : type === "detach" ? "removed from OneRoster management" : "deactivated"}`);
    state.selected.clear(); state.modal = null; render();
  }
  if (action === "confirm-delete-association") {
    const { item, choice } = state.modal;
    const affected = new Set(coursesForAssociation(item));
    if (choice === "delete") { affected.forEach(name => state.selected.add(name)); deleteSelectedCourses(); } else affected.forEach(name => state.detached.add(name));
    state.associations = state.associations.filter(entry => entry.id !== item.id);
    state.selectedProduct.associationCount = Math.max(0, state.selectedProduct.associationCount - 1);
    state.expandedAssociationIds.delete(item.id); state.selected.clear(); updateAssociationCounts();
    toast("Association deleted"); state.modal = null; render();
  }
});
modalRoot.addEventListener("change", event => {
  if (event.target.name === "level") modalRoot.querySelector('[name="type"]').disabled = !event.target.value;
  if (event.target.name === "association-delete-choice") { state.modal.choice = event.target.value; renderModal(); }
});
modalRoot.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const level = form.get("level"), type = form.get("type"), value = form.get("value").trim();
  if (!level || !type || !value) { toast("Complete all association fields"); return; }
  if (state.modal.type === "edit") Object.assign(state.modal.item, { level, type, value });
  else {
    state.associations.push({ id: Date.now(), type, level, value, courseNames: [] });
    state.selectedProduct.associationCount += 1;
  }
  updateAssociationCounts(); toast(state.modal.type === "edit" ? "Association updated" : "Association added"); state.modal = null; render();
});
document.addEventListener("keydown", event => { if (event.key === "Escape" && state.modal) { state.modal = null; renderModal(); } });
render();
