// Initialize jsPDF
window.jsPDF = window.jspdf.jsPDF;
let rowCounter = 0;

// Helper function for currency formatting
function formatCurrency(amount) {
    return `KES ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Function to create a product row
function createProductRow() {
    const row = document.createElement('div');
    row.className = 'product-row';
    row.id = `product-row-${rowCounter}`;

    row.innerHTML = `
        <div class="input-group">
            <label><i class="fas fa-tags"></i> Category</label>
            <select onchange="updateEquipmentList(${rowCounter})" id="category-${rowCounter}">
                <option value="">-- Select Category --</option>
                ${Object.keys(productDatabase).map(category => {
                    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
                    return `<option value="${category}">${formattedCategory}</option>`;
                }).join('')}
            </select>
        </div>
        <div class="input-group">
            <label><i class="fas fa-shopping-cart"></i> Product</label>
            <select id="equipment-${rowCounter}" class="equipment-select">
                <option value="">-- Select Product --</option>
            </select>
        </div>
        <div class="input-group quantity">
            <label><i class="fas fa-hashtag"></i> Quantity</label>
            <input type="number" id="quantity-${rowCounter}" min="1" value="1">
        </div>
        <button onclick="removeProductRow(${rowCounter})" class="remove-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;

    return row;
}

// Function to add a product row
function addProductRow() {
    const container = document.getElementById('products-container');
    container.appendChild(createProductRow());
    rowCounter++;
}

// Function to remove a product row
function removeProductRow(id) {
    document.getElementById(`product-row-${id}`).remove();
}

// Function to update equipment list based on selected category
function updateEquipmentList(rowId) {
    const categorySelect = document.getElementById(`category-${rowId}`);
    const equipmentSelect = document.getElementById(`equipment-${rowId}`);
    const selectedCategory = categorySelect.value;

    equipmentSelect.innerHTML = '<option value="">-- Select Product --</option>';

    if (!selectedCategory) return;

    const products = productDatabase[selectedCategory];
    if (products) {
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = `${product.name}|${product.price}`;
            option.textContent = `${product.name} - KES ${product.price.toFixed(2)}`;
            equipmentSelect.appendChild(option);
        });
    }
}

// Function to get product details from value
function getProductFromValue(value) {
    if (!value) return null;
    const [name, price] = value.split('|');
    return {
        name: name,
        price: parseFloat(price)
    };
}

// Function to calculate totals and display summary
function calculateTotals() {
    const productSummary = document.getElementById('product-summary');
    productSummary.innerHTML = '';

    let grandSubtotal = 0;
    let grandVat = 0;
    const validProducts = [];

    for (let i = 0; i < rowCounter; i++) {
        const row = document.getElementById(`product-row-${i}`);
        if (!row) continue;

        const equipmentSelect = document.getElementById(`equipment-${i}`);
        const quantityInput = document.getElementById(`quantity-${i}`);

        if (!equipmentSelect.value) continue;

        const product = getProductFromValue(equipmentSelect.value);
        const quantity = parseInt(quantityInput.value) || 0;

        if (quantity > 0) {
            validProducts.push({ product, quantity });
        }
    }

    validProducts.forEach(({ product, quantity }) => {
        const subtotal = product.price * quantity;
        const vat = subtotal * 0.16;
        const total = subtotal + vat;

        grandSubtotal += subtotal;
        grandVat += vat;

        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <div class="item-details">
                <span class="item-name">${product.name}</span>
                <span class="item-quantity">× ${quantity}</span>
            </div>
            <div class="item-prices">
                <div>Subtotal: KES ${subtotal.toFixed(2)}</div>
                <div>VAT: KES ${vat.toFixed(2)}</div>
                <div>Total: KES ${total.toFixed(2)}</div>
            </div>
        `;
        productSummary.appendChild(summaryItem);
    });

    const grandTotal = grandSubtotal + grandVat;

    document.getElementById('grand-subtotal').textContent = `KES ${grandSubtotal.toFixed(2)}`;
    document.getElementById('grand-vat').textContent = `KES ${grandVat.toFixed(2)}`;
    document.getElementById('grand-total').textContent = `KES ${grandTotal.toFixed(2)}`;

    document.getElementById('result').classList.add('visible');
}

// Function to generate quotation PDF
function generateQuotationPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Colors
    const primaryColor = [30, 60, 114];  // Persian blue for QUOTATION title
    const secondaryColor = [42, 82, 152];
    const accentColor = [255, 0, 129];
    const darkTextColor = [0, 0, 0];  // Darker text color for totals

    doc.setFont("helvetica", "bold");

    // Center logo
    try {
        doc.addImage('assets/zocom no bg logo.png', 'PNG', pageWidth / 2 - 10, 10, 20, 20);
    } catch (error) {
        console.error('Error loading logo:', error);
    }

    // Title with Persian blue color and added spacing
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("QUOTATION", pageWidth / 2, 45, { align: "center" });

    // Quotation details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0);

    const quotationNumber = `QT${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;
    doc.text(`Quotation No: ${quotationNumber}`, 15, 55);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 60);
    doc.text(`Valid Until: ${document.getElementById('quotation-validity').value || 'N/A'}`, 15, 65);

    // Contact details block
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(15, 70, pageWidth - 15, 70);
    doc.setLineWidth(0.5);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("BILL TO:", 15, 80);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);

    // Customer details
    const customerName = document.getElementById('customer-name').value || 'N/A';
    const customerEmail = document.getElementById('customer-email').value || 'N/A';
    const customerPhone = document.getElementById('customer-phone').value || 'N/A';
    doc.text(`Name: ${customerName}`, 15, 90);
    doc.text(`Email: ${customerEmail}`, 15, 95);
    doc.text(`Phone: ${customerPhone}`, 15, 100);

    // Table with auto-pagination
    const tableData = [];
    document.querySelectorAll('.product-row').forEach((row, index) => {
        const equipmentSelect = row.querySelector('.equipment-select');
        const quantityInput = row.querySelector('input[type="number"]');

        if (equipmentSelect?.value && quantityInput?.value) {
            const product = getProductFromValue(equipmentSelect.value);
            const quantity = parseInt(quantityInput.value);

            if (product && quantity > 0) {
                const subtotal = product.price * quantity;
                const vat = subtotal * 0.16;
                tableData.push([
                    index + 1,
                    product.name,
                    quantity,
                    formatCurrency(product.price),
                    formatCurrency(subtotal),
                    formatCurrency(vat),
                    formatCurrency(subtotal + vat)
                ]);
            }
        }
    });

    doc.autoTable({
        startY: 110,
        head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Subtotal', 'VAT', 'Total']],
        body: tableData,
        theme: 'striped',
        styles: {
            fontSize: 9,
            cellPadding: 4,
            lineColor: [80, 80, 80],
            lineWidth: 0.1,
            font: "helvetica"
        },
        headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 60 },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 20, halign: 'right' },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 25, halign: 'right' },
            6: { cellWidth: 25, halign: 'right' }
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { left: 15, right: 15 },
        didDrawPage: function (data) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.text('Thank you for choosing our services!', pageWidth / 2, pageHeight - 20, { align: 'center' });
            doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
        }
    });

    // Total summary with improved padding, alignment, and darker text
    const finalY = doc.lastAutoTable.finalY + 10;

    // Add background box for totals section with bottom padding
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(pageWidth - 85, finalY, 70, 50, 3, 3, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    // Labels
    const totalLabelsX = pageWidth - 80;
    const totalValuesX = pageWidth - 20;

    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text("Subtotal:", totalLabelsX, finalY + 10);
    doc.text("VAT (16%):", totalLabelsX, finalY + 25);
    doc.text("GRAND TOTAL:", totalLabelsX, finalY + 40);

    // Values aligned to the right with darker text
    doc.setFont("helvetica", "normal");
    doc.text(document.getElementById('grand-subtotal').textContent, totalValuesX, finalY + 10, { align: 'right' });
    doc.text(document.getElementById('grand-vat').textContent, totalValuesX, finalY + 25, { align: 'right' });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]); // Highlight grand total
    doc.text(document.getElementById('grand-total').textContent, totalValuesX, finalY + 40, { align: 'right' });

    // Save PDF
    doc.save(`Quotation_${quotationNumber}.pdf`);
}

// Add to script.js

// ============== Discount System ==============
const discountTypes = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
    BULK: 'bulk'
};

function initializeDiscountSystem() {
    const discountContainer = document.createElement('div');
    discountContainer.className = 'discount-container';
    discountContainer.innerHTML = `
        <div class="discount-controls">
            <select id="discount-type" class="discount-select">
                <option value="">Select Discount Type</option>
                <option value="percentage">Percentage Discount</option>
                <option value="fixed">Fixed Amount Discount</option>
                <option value="bulk">Bulk Purchase Discount</option>
            </select>
            <input type="number" id="discount-value" placeholder="Discount Value" class="discount-input" min="0" step="0.01">
            <button id="apply-discount" class="discount-btn">Apply Discount</button>
        </div>
        <div id="active-discounts" class="active-discounts"></div>
    `;

    // Insert after product container
    const resultSection = document.getElementById('result');
    resultSection.parentNode.insertBefore(discountContainer, resultSection);

    // Add event listeners
    document.getElementById('apply-discount').addEventListener('click', applyDiscount);
}

function applyDiscount() {
    const type = document.getElementById('discount-type').value;
    const value = parseFloat(document.getElementById('discount-value').value);
    
    if (!type || !value) {
        showNotification('Please select discount type and value', 'error');
        return;
    }

    // Apply discount based on type
    let discountAmount = 0;
    const subtotal = parseFloat(document.getElementById('grand-subtotal').textContent.replace('KES ', ''));

    switch(type) {
        case discountTypes.PERCENTAGE:
            discountAmount = (subtotal * value) / 100;
            break;
        case discountTypes.FIXED:
            discountAmount = value;
            break;
        case discountTypes.BULK:
            // Apply bulk discount if total quantity is above threshold
            const totalQuantity = calculateTotalQuantity();
            if (totalQuantity >= 10) {
                discountAmount = (subtotal * value) / 100;
            }
            break;
    }

    // Update totals with discount
    updateTotalsWithDiscount(discountAmount);
    displayActiveDiscount(type, value, discountAmount);
}

// ============== Quotation History ==============
function saveQuotationToHistory() {
    const quotation = {
        id: generateQuotationId(),
        date: new Date().toISOString(),
        customer: {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value
        },
        products: getSelectedProducts(),
        totals: {
            subtotal: document.getElementById('grand-subtotal').textContent,
            vat: document.getElementById('grand-vat').textContent,
            total: document.getElementById('grand-total').textContent
        },
        discounts: getActiveDiscounts()
    };

    let history = JSON.parse(localStorage.getItem('quotationHistory') || '[]');
    history.unshift(quotation);
    localStorage.setItem('quotationHistory', JSON.stringify(history));
}

function initializeHistoryViewer() {
    const historyBtn = document.createElement('button');
    historyBtn.id = 'view-history';
    historyBtn.className = 'history-btn';
    historyBtn.innerHTML = '<i class="fas fa-history"></i> View History';
    historyBtn.onclick = showHistoryModal;

    document.querySelector('.buttons-container').appendChild(historyBtn);
}

function showHistoryModal() {
    const history = JSON.parse(localStorage.getItem('quotationHistory') || '[]');
    
    const modal = document.createElement('div');
    modal.className = 'history-modal';
    modal.innerHTML = `
        <div class="history-content">
            <h2>Quotation History</h2>
            <div class="history-list">
                ${history.map(quotation => `
                    <div class="history-item" onclick="loadQuotation('${quotation.id}')">
                        <div class="history-header">
                            <span>ID: ${quotation.id}</span>
                            <span>${new Date(quotation.date).toLocaleDateString()}</span>
                        </div>
                        <div class="history-details">
                            <p>Customer: ${quotation.customer.name}</p>
                            <p>Total: ${quotation.totals.total}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ============== Customer Profile Management ==============
function initializeCustomerProfiles() {
    const profilesContainer = document.createElement('div');
    profilesContainer.className = 'customer-profiles';
    profilesContainer.innerHTML = `
        <div class="profile-controls">
            <button id="save-profile" class="profile-btn">Save Customer Profile</button>
            <button id="load-profile" class="profile-btn">Load Profile</button>
        </div>
    `;

    document.querySelector('.customer-details').appendChild(profilesContainer);

    // Add event listeners
    document.getElementById('save-profile').addEventListener('click', saveCustomerProfile);
    document.getElementById('load-profile').addEventListener('click', showProfilesModal);
}

function saveCustomerProfile() {
    const profile = {
        id: generateProfileId(),
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        savedDate: new Date().toISOString()
    };

    if (!profile.name || !profile.email) {
        showNotification('Please fill in customer details', 'error');
        return;
    }

    let profiles = JSON.parse(localStorage.getItem('customerProfiles') || '[]');
    profiles.push(profile);
    localStorage.setItem('customerProfiles', JSON.stringify(profiles));
    showNotification('Customer profile saved successfully', 'success');
}

// ============== Utility Functions ==============
function generateQuotationId() {
    return 'QT' + Date.now().toString().slice(-6);
}

function generateProfileId() {
    return 'CP' + Date.now().toString().slice(-6);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize new features
document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization code...
    
    // Initialize new features
    initializeDiscountSystem();
    initializeHistoryViewer();
    initializeCustomerProfiles();
});

// Add these functions to script.js

function updateTotalsWithDiscount(discountAmount) {
    // Get current totals
    const subtotalElement = document.getElementById('grand-subtotal');
    const vatElement = document.getElementById('grand-vat');
    const totalElement = document.getElementById('grand-total');
    
    // Get current values
    const currentSubtotal = parseFloat(subtotalElement.textContent.replace('KES ', ''));
    
    // Calculate new values
    const newSubtotal = currentSubtotal - discountAmount;
    const newVat = newSubtotal * 0.16; // 16% VAT
    const newTotal = newSubtotal + newVat;
    
    // Update display
    subtotalElement.textContent = `KES ${newSubtotal.toFixed(2)}`;
    vatElement.textContent = `KES ${newVat.toFixed(2)}`;
    totalElement.textContent = `KES ${newTotal.toFixed(2)}`;
}

function calculateTotalQuantity() {
    let totalQuantity = 0;
    document.querySelectorAll('[id^="quantity-"]').forEach(input => {
        totalQuantity += parseInt(input.value) || 0;
    });
    return totalQuantity;
}

function displayActiveDiscount(type, value, amount) {
    const activeDiscounts = document.getElementById('active-discounts');
    const discountElement = document.createElement('div');
    discountElement.className = 'discount-tag';
    
    let discountText = '';
    switch(type) {
        case 'percentage':
            discountText = `${value}% Off`;
            break;
        case 'fixed':
            discountText = `KES ${value} Off`;
            break;
        case 'bulk':
            discountText = `Bulk Discount: ${value}%`;
            break;
    }
    
    discountElement.innerHTML = `
        <span>${discountText}</span>
        <span>-KES ${amount.toFixed(2)}</span>
        <button onclick="this.parentElement.remove(); resetDiscount();" class="remove-discount">×</button>
    `;
    
    // Clear previous discounts
    activeDiscounts.innerHTML = '';
    activeDiscounts.appendChild(discountElement);
}

function resetDiscount() {
    // Recalculate totals without discount
    calculateTotals();
}

function getActiveDiscounts() {
    const discounts = [];
    document.querySelectorAll('.discount-tag').forEach(tag => {
        discounts.push({
            text: tag.querySelector('span').textContent,
            amount: parseFloat(tag.querySelector('span:nth-child(2)').textContent.replace('KES -', ''))
        });
    });
    return discounts;
}

function getSelectedProducts() {
    const products = [];
    document.querySelectorAll('.product-row').forEach((row, index) => {
        const categorySelect = document.getElementById(`category-${index}`);
        const equipmentSelect = document.getElementById(`equipment-${index}`);
        const quantityInput = document.getElementById(`quantity-${index}`);
        
        if (categorySelect?.value && equipmentSelect?.value) {
            const [name, price] = equipmentSelect.value.split('|');
            products.push({
                category: categorySelect.value,
                name: name,
                price: parseFloat(price),
                quantity: parseInt(quantityInput.value) || 0
            });
        }
    });
    return products;
}

// Initialize the product row upon loading
document.addEventListener('DOMContentLoaded', addProductRow);
