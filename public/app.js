const API_BASE = "/api/items"

const tbody = document.getElementById("itemsTbody")
const searchInput = document.getElementById("searchInput")
const searchBtn = document.getElementById("searchBtn")
const clearBtn = document.getElementById("clearBtn")

const itemForm = document.getElementById("itemForm")
const formTitle = document.getElementById("formTitle")
const cancelEditBtn = document.getElementById("cancelEditBtn")
const submitBtn = document.getElementById("submitBtn")

const itemId = document.getElementById("itemId")
const code = document.getElementById("code")
const nameInput = document.getElementById("name")
const description = document.getElementById("description")
const qty = document.getElementById("qty")
const price = document.getElementById("price")
const photo = document.getElementById("photo")
const photoPreview = document.getElementById("photoPreview")

const addNewBtn = document.getElementById("addNewBtn")
const removePhotoBtn = document.getElementById("removePhoto")
const fileUploadArea = document.getElementById("fileUploadArea")
const confirmModal = document.getElementById("confirmModal")
const closeModal = document.getElementById("closeModal")
const confirmAction = document.getElementById("confirmAction")
const cancelAction = document.getElementById("cancelAction")
const modalTitle = document.getElementById("modalTitle")
const modalMessage = document.getElementById("modalMessage")

const totalItemsEl = document.getElementById("totalItems")
const totalValueEl = document.getElementById("totalValue")
const lowStockEl = document.getElementById("lowStock")

let pendingDeleteId = null

// Import lucide
const lucide = window.lucide

// Cargar listado inicial
window.addEventListener("DOMContentLoaded", () => {
  loadItems()
})

// Buscar
searchBtn.addEventListener("click", () => {
  loadItems(searchInput.value.trim())
})

clearBtn.addEventListener("click", () => {
  searchInput.value = ""
  loadItems()
})

addNewBtn.addEventListener("click", () => {
  resetForm()
  document.querySelector(".form-card").scrollIntoView({ behavior: "smooth" })
})

fileUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault()
  fileUploadArea.style.borderColor = "var(--primary)"
  fileUploadArea.style.background = "var(--primary-light)"
})

fileUploadArea.addEventListener("dragleave", (e) => {
  e.preventDefault()
  fileUploadArea.style.borderColor = "var(--border)"
  fileUploadArea.style.background = "var(--bg-primary)"
})

fileUploadArea.addEventListener("drop", (e) => {
  e.preventDefault()
  fileUploadArea.style.borderColor = "var(--border)"
  fileUploadArea.style.background = "var(--bg-primary)"

  const files = e.dataTransfer.files
  if (files.length > 0 && files[0].type.startsWith("image/")) {
    photo.files = files
    handlePhotoPreview(files[0])
  }
})

photo.addEventListener("change", (e) => {
  const file = e.target.files?.[0]
  if (file) {
    handlePhotoPreview(file)
  } else {
    hidePhotoPreview()
  }
})

removePhotoBtn.addEventListener("click", () => {
  photo.value = ""
  hidePhotoPreview()
})

function handlePhotoPreview(file) {
  if (!file.type.startsWith("image/")) {
    alert("Por favor selecciona un archivo de imagen válido")
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    alert("El archivo es demasiado grande. Máximo 10MB")
    return
  }

  const url = URL.createObjectURL(file)
  photoPreview.src = url
  document.querySelector(".preview").style.display = "flex"
  document.querySelector(".upload-placeholder").style.display = "none"
}

function hidePhotoPreview() {
  photoPreview.style.display = "none"
  photoPreview.src = ""
  document.querySelector(".preview").style.display = "none"
  document.querySelector(".upload-placeholder").style.display = "flex"
}

function showConfirmModal(title, message, onConfirm) {
  modalTitle.textContent = title
  modalMessage.textContent = message
  confirmModal.classList.remove("hidden")

  confirmAction.onclick = () => {
    onConfirm()
    hideConfirmModal()
  }
}

function hideConfirmModal() {
  confirmModal.classList.add("hidden")
  pendingDeleteId = null
}

closeModal.addEventListener("click", hideConfirmModal)
cancelAction.addEventListener("click", hideConfirmModal)

confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) {
    hideConfirmModal()
  }
})

// Submit (Crear / Actualizar)
itemForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  if (!code.value.trim()) {
    alert("El código del producto es requerido")
    code.focus()
    return
  }

  if (!nameInput.value.trim()) {
    alert("El nombre del producto es requerido")
    nameInput.focus()
    return
  }

  const data = new FormData()
  data.append("code", code.value.trim())
  data.append("name", nameInput.value.trim())
  data.append("description", description.value.trim())
  data.append("qty", qty.value)
  data.append("price", price.value)
  if (photo.files[0]) data.append("photo", photo.files[0])

  const originalText = submitBtn.innerHTML
  submitBtn.innerHTML = '<i data-lucide="loader-2"></i> Guardando...'
  submitBtn.disabled = true

  try {
    let response
    if (itemId.value) {
      response = await fetch(`${API_BASE}/${itemId.value}`, {
        method: "PUT",
        body: data,
      })
    } else {
      response = await fetch(API_BASE, {
        method: "POST",
        body: data,
      })
    }

    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor")
    }

    resetForm()
    await loadItems(searchInput.value.trim())

    document.querySelector(".table-card").scrollIntoView({ behavior: "smooth" })
  } catch (err) {
    alert("Error guardando el producto")
    console.error(err)
  } finally {
    submitBtn.innerHTML = originalText
    submitBtn.disabled = false
    setTimeout(() => lucide.createIcons(), 0)
  }
})

// Cancelar edición
cancelEditBtn.addEventListener("click", () => resetForm())

function resetForm() {
  itemForm.reset()
  itemId.value = ""
  formTitle.innerHTML = '<i data-lucide="plus-circle"></i> Crear Producto'
  submitBtn.innerHTML = '<i data-lucide="save"></i> Guardar Producto'
  cancelEditBtn.classList.add("hidden")
  hidePhotoPreview()

  setTimeout(() => lucide.createIcons(), 0)
}

async function loadItems(q) {
  try {
    const url = q ? `${API_BASE}?q=${encodeURIComponent(q)}` : API_BASE
    const res = await fetch(url)
    const items = await res.json()
    renderTable(items)
  } catch (err) {
    console.error(err)
    alert("Error cargando productos")
  }
}

function renderTable(items) {
  tbody.innerHTML = ""

  if (!Array.isArray(items) || items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 3rem; color: var(--text-muted);">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <i data-lucide="package-x" style="width: 48px; height: 48px;"></i>
            <p>No se encontraron productos</p>
          </div>
        </td>
      </tr>
    `
    updateStats(items)
    setTimeout(() => lucide.createIcons(), 0)
    return
  }

  for (const it of items) {
    const tr = document.createElement("tr")

    const tdPhoto = document.createElement("td")
    if (it.photo) {
      const img = document.createElement("img")
      img.src = it.photo
      img.alt = it.name ?? "foto"
      img.className = "thumb"
      img.onclick = () => showImageModal(it.photo, it.name)
      tdPhoto.appendChild(img)
    } else {
      tdPhoto.innerHTML = `
        <div style="width: 64px; height: 64px; background: var(--bg-secondary); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
          <i data-lucide="image" style="width: 24px; height: 24px;"></i>
        </div>
      `
    }

    const tdCode = document.createElement("td")
    tdCode.innerHTML = `<code style="background: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${it.code ?? ""}</code>`

    const tdName = document.createElement("td")
    tdName.innerHTML = `<strong>${it.name ?? ""}</strong>`

    const tdDesc = document.createElement("td")
    tdDesc.textContent = it.description ?? ""
    tdDesc.style.maxWidth = "200px"
    tdDesc.style.overflow = "hidden"
    tdDesc.style.textOverflow = "ellipsis"
    tdDesc.style.whiteSpace = "nowrap"

    const tdQty = document.createElement("td")
    const qty = it.qty ?? 0
    const stockClass = qty < 10 ? "danger" : qty < 50 ? "warning" : "success"
    tdQty.innerHTML = `
      <span style="background: var(--${stockClass}-light); color: var(--${stockClass}); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
        ${qty}
      </span>
    `

    const tdPrice = document.createElement("td")
    tdPrice.innerHTML = `<strong>$${Number.parseFloat(it.price ?? 0).toFixed(2)}</strong>`

    const tdActions = document.createElement("td")
    const editBtn = document.createElement("button")
    editBtn.innerHTML = '<i data-lucide="edit"></i>'
    editBtn.className = "btn-outline"
    editBtn.style.padding = "0.5rem"
    editBtn.title = "Editar producto"
    editBtn.addEventListener("click", () => fillFormForEdit(it))

    const delBtn = document.createElement("button")
    delBtn.innerHTML = '<i data-lucide="trash-2"></i>'
    delBtn.className = "btn-danger"
    delBtn.style.padding = "0.5rem"
    delBtn.title = "Eliminar producto"
    delBtn.addEventListener("click", () => {
      showConfirmModal(
        "Eliminar Producto",
        `¿Estás seguro de que deseas eliminar "${it.name}"? Esta acción no se puede deshacer.`,
        () => deleteItem(it.id),
      )
    })

    const actionsDiv = document.createElement("div")
    actionsDiv.style.display = "flex"
    actionsDiv.style.gap = "0.5rem"
    actionsDiv.append(editBtn, delBtn)
    tdActions.appendChild(actionsDiv)

    tr.append(tdPhoto, tdCode, tdName, tdDesc, tdQty, tdPrice, tdActions)
    tbody.appendChild(tr)
  }

  updateStats(items)

  setTimeout(() => lucide.createIcons(), 0)
}

function updateStats(items) {
  if (!Array.isArray(items)) items = []

  const totalItems = items.length
  const totalValue = items.reduce(
    (sum, item) => sum + Number.parseFloat(item.price || 0) * Number.parseInt(item.qty || 0),
    0,
  )
  const lowStock = items.filter((item) => Number.parseInt(item.qty || 0) < 10).length

  totalItemsEl.textContent = totalItems.toLocaleString()
  totalValueEl.textContent = `$${totalValue.toLocaleString("es-ES", { minimumFractionDigits: 2 })}`
  lowStockEl.textContent = lowStock.toLocaleString()
}

function fillFormForEdit(it) {
  itemId.value = it.id
  code.value = it.code ?? ""
  nameInput.value = it.name ?? ""
  description.value = it.description ?? ""
  qty.value = it.qty ?? 0
  price.value = it.price ?? 0

  formTitle.innerHTML = '<i data-lucide="edit"></i> Editar Producto'
  submitBtn.innerHTML = '<i data-lucide="save"></i> Actualizar Producto'
  cancelEditBtn.classList.remove("hidden")

  // Previsualizar imagen actual (si existe)
  if (it.photo) {
    photoPreview.src = it.photo
    document.querySelector(".preview").style.display = "flex"
    document.querySelector(".upload-placeholder").style.display = "none"
  } else {
    hidePhotoPreview()
  }

  // Limpia input file
  photo.value = ""

  document.querySelector(".form-card").scrollIntoView({ behavior: "smooth" })

  setTimeout(() => lucide.createIcons(), 0)
}

async function deleteItem(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" })
    if (response.ok) {
      await loadItems(searchInput.value.trim())
      console.log("Producto eliminado correctamente")
    } else {
      throw new Error("Error en la respuesta del servidor")
    }
  } catch (err) {
    console.error(err)
    alert("Error eliminando el producto")
  }
}

function showImageModal(src, alt) {
  // Implementación opcional para mostrar imagen en grande
  window.open(src, "_blank")
}
