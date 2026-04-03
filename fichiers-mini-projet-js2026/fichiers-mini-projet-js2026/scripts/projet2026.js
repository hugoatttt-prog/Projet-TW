// Hugo Aubergier et El Haddouchi Zakaria 



// ===  variables globales === 

// constantes
const MAX_QTY = 9;

//  tableau des produits à acheter
const cart = []
// total actuel des produits dans le panier
let total = 0;


// === initialisation au chargement de la page ===

/**
* Création du Magasin, mise à jour du total initial
* Mise en place du gestionnaire d'événements sur filter
* Chargement du panier sauvegardé
*/
const init = function () {
	createShop();
	const filter = document.getElementById("filter");
	filter.addEventListener("keyup", filterDisplaidProducts);
	const saveCartBtn = document.getElementById("saveCart");
	saveCartBtn.addEventListener("click", saveCart);
	loadCart();
	updateTotal();
}


// ==================== fonctions utiles =======================


/**
* Sauvegarde le panier dans le localStorage du navigateur
*/
const saveCart = function () {
	// Récupérer tous les articles du panier
	const cartItems = [];
	const allCartItems = document.querySelectorAll(".achat");
	
	allCartItems.forEach(function(item) {
		const itemId = item.id.split("-")[0]; // Extraire l'index du produit
		const itemQty = parseInt(item.querySelector(".quantite").value);
		
		cartItems.push({
			index: itemId,
			quantity: itemQty
		});
	});
	
	// Sauvegarder le panier en JSON dans localStorage
	localStorage.setItem("panier", JSON.stringify(cartItems));
	
	// Afficher un message de confirmation
	alert("Panier sauvegardé avec succès !");
}


/**
* Charge le panier depuis le localStorage du navigateur
*/
const loadCart = function () {
	// Récupérer le panier sauvegardé depuis localStorage
	const savedCart = localStorage.getItem("panier");
	
	if (savedCart) {
		try {
			// Convertir la chaîne JSON en tableau d'objets
			const cartItems = JSON.parse(savedCart);
			
			// Ajouter chaque article au panier
			cartItems.forEach(function(item) {
				const index = parseInt(item.index);
				const quantity = parseInt(item.quantity);
				
				if (index >= 0 && index < catalog.length && quantity > 0) {
					// Créer l'article directement sans passer par addProductToCart
					// qui appellerait updateCartTotal à chaque fois
					createCartItem(index, quantity);
				}
			});
			
			// Mettre à jour le total une seule fois après avoir chargé tous les articles
			updateCartTotal();
		} catch (error) {
			console.error("Erreur lors du chargement du panier:", error);
		}
	}
}


/**
* Crée un article dans le panier (utilisé pour le chargement initial)
* @param {number} index - l'indice du produit
* @param {number} qty - la quantité
*/
const createCartItem = function (index, qty) {
	const product = catalog[index];
	
	// Créer la div.achat
	const achatDiv = document.createElement("div");
	achatDiv.className = "achat";
	achatDiv.id = index + "-achat";
	
	// Créer et ajouter la figure avec l'image
	const figure = document.createElement("figure");
	const img = document.createElement("img");
	img.src = product.image;
	img.alt = product.description;
	figure.appendChild(img);
	achatDiv.appendChild(figure);
	
	// Créer et ajouter le h4 avec la description
	const h4 = document.createElement("h4");
	h4.textContent = product.description;
	achatDiv.appendChild(h4);
	
	// Créer et ajouter l'input.quantite
	const quantiteInput = document.createElement("input");
	quantiteInput.className = "quantite";
	quantiteInput.type = "number";
	quantiteInput.value = qty;
	quantiteInput.min = "1";
	quantiteInput.max = MAX_QTY.toString();
	quantiteInput.addEventListener("change", function() {
		updateCartTotal();
	});
	achatDiv.appendChild(quantiteInput);
	
	// Créer et ajouter la div.prix
	const prixDiv = document.createElement("div");
	prixDiv.className = "prix";
	prixDiv.textContent = product.price;
	achatDiv.appendChild(prixDiv);
	
	// Créer et ajouter la div.controle avec le bouton de suppression
	const controleDiv = document.createElement("div");
	controleDiv.className = "controle";
	
	const removeButton = document.createElement("button");
	removeButton.className = "retirer";
	removeButton.id = index + "-remove";
	removeButton.addEventListener("click", function(event) {
		const buttonId = event.target.id;
		const productIndex = parseInt(buttonId.split("-")[0]);
		removeProductFromCart(productIndex);
	});
	controleDiv.appendChild(removeButton);
	achatDiv.appendChild(controleDiv);
	
	// Ajouter la div.achat à la div.achats
	const achatsDiv = document.querySelector(".achats");
	achatsDiv.appendChild(achatDiv);
} 

/**
* Crée et ajoute tous les éléments div.produit à l'élément div#boutique
* selon les objets présents dans la variable 'catalog'
*/
const createShop = function () {
	const shop = document.getElementById("boutique");
	for(let i = 0; i < catalog.length; i++) {
		shop.appendChild(createProduct(catalog[i], i));
	}
}

/**
* Crée un élément div.produit qui posséde un id de la forme "i-produit" où l'indice i 
* est correpond au paramètre index
* @param {Object} product - le produit pour lequel l'élément est créé
* @param {number} index - l'indice (nombre entier) du produit dans le catalogue (utilisé pour l'id)
* @return {Element} une div.produit
*/
const createProduct = function (product, index) {
	// créer la div correpondant au produit
	const divProd = document.createElement("div");
	divProd.className = "produit";
	// fixe la valeur de l'id pour cette div
	divProd.id = index + "-product";
	// crée l'élément h4 dans cette div
	divProd.appendChild(createBlock("h4", product.name));
	
	// Ajoute une figure à la div.produit... 
	// /!\ non fonctionnel tant que le code de createFigureBlock n'a pas été modifié /!\ 
	divProd.appendChild(createFigureBlock(product));

	// crée la div.description et l'ajoute à la div.produit
	divProd.appendChild(createBlock("div", product.description, "description"));
	// crée la div.prix et l'ajoute à la div.produit
	divProd.appendChild(createBlock("div", product.price, "prix"));
	// crée la div.controle et l'ajoute à la div.produit
	divProd.appendChild(createOrderControlBlock(index));
	return divProd;
}


/** Crée un nouvel élément avec son contenu et éventuellement une classe
 * @param {string} tag - le type de l'élément créé (example : "p")
 * @param {string} content - le contenu html de l'élément a créé  (example : "bla bla")
 * @param {string} [cssClass] - (optionnel) la valeur de l'attribut 'classe' de l'élément créé
 * @return {Element} élément créé
 */
const createBlock = function (tag, content, cssClass) {
	const element = document.createElement(tag);
	if (cssClass != undefined) {
		element.className =  cssClass;
	}
	element.innerHTML = String(content);
	return element;
}


/** Met à jour le montant total du panier en utilisant la variable globale total
 */
const updateTotal = function () {
	const montant = document.getElementById("montant");
	montant.textContent = total;
}

// ======================= fonctions à compléter =======================


/**
* Crée un élément div.controle pour un objet produit
* @param {number} index - indice du produit considéré
* @return {Element}
*/
const createOrderControlBlock = function (index) {
	const control = document.createElement("div");
	control.className = "controle";

	// crée l'élément input permettant de saisir la quantité
	const input = document.createElement("input");
	input.id = index + "-qte";
	input.type = "number";
	input.step = "1";
	input.value = "0";
	input.min = "0";
	input.max = MAX_QTY.toString();

	input.addEventListener('input', function(event){
		verifQuantity(event, index);
	});
	control.appendChild(input);

	const button = document.createElement("button");
	button.className = 'commander';
	button.id = index + "-order";
	button.style.opacity = 0.25;
	button.addEventListener("click", orderProduct);
	control.appendChild(button);

	return control;
}


/** 
* Crée un élément figure correspondant à un produit
* @param {Object} product -  le produit pour lequel la figure est créée
* @return {Element}
*/
const createFigureBlock = function (product) {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = product.image ; // Ex: "images/produit1.jpg"
    img.alt = product.name ;
    figure.appendChild(img);
    return figure;
}



/** 
* @todo Q8
*/

const orderProduct = function () {
	const idx = parseInt(this.id);
	const qteInput = document.getElementById(idx + "-qte");
	const qty = parseInt(qteInput.value);
	if (qty > 0) {
		addProductToCart(idx, qty);
		qteInput.value = "0";
		this.style.opacity = 0.25;
	}
}


/**
* @todo Q6- Q7
*/
const verifQuantity = function(event, index) {
    const input = event.target;
	let valeur = parseInt(input.value);

	if (isNaN(valeur) || valeur < 0 || valeur > MAX_QTY) {
        input.value = 0;
        valeur = 0;
    }
	const bouton = document.getElementById(index + "-order");
	if (valeur > 0) {
		bouton.style.opacity = 1;
	} else {
		bouton.style.opacity = 0.25;
	}
};



/**
* @todo Q9
* @param {number} index
* @param {number} qty
*/
const addProductToCart = function (index, qty) {
	const existingCartItem = document.getElementById(index + "-achat");
	
	if (existingCartItem) {
		const quantityInput = existingCartItem.querySelector(".quantite");
		const currentQty = parseInt(quantityInput.value);
		const newQty = currentQty + qty;
		quantityInput.value = newQty;
		updateCartTotal();
	} else {
		const product = catalog[index];
		
		const achatDiv = document.createElement("div");
		achatDiv.className = "achat";
		achatDiv.id = index + "-achat";
		
		const figure = document.createElement("figure");
		const img = document.createElement("img");
		img.src = product.image;
		img.alt = product.description;
		figure.appendChild(img);
		achatDiv.appendChild(figure);
		
		const h4 = document.createElement("h4");
		h4.textContent = product.description;
		achatDiv.appendChild(h4);
		
		const quantiteInput = document.createElement("input");
		quantiteInput.className = "quantite";
		quantiteInput.type = "number";
		quantiteInput.value = qty;
		quantiteInput.min = "1";
		quantiteInput.max = MAX_QTY.toString();
		quantiteInput.addEventListener("change", function() {
			updateCartTotal();
		});
		achatDiv.appendChild(quantiteInput);
		
		const prixDiv = document.createElement("div");
		prixDiv.className = "prix";
		prixDiv.textContent = product.price;
		achatDiv.appendChild(prixDiv);
		
		const controleDiv = document.createElement("div");
		controleDiv.className = "controle";
		
		const removeButton = document.createElement("button");
		removeButton.className = "retirer";
		removeButton.id = index + "-remove";
		removeButton.addEventListener("click", function(event) {
			// Récupérer l'ID du bouton et extraire l'index du produit
			const buttonId = event.target.id; // par exemple "3-remove"
			const productIndex = parseInt(buttonId.split("-")[0]);
			removeProductFromCart(productIndex);
		});
		controleDiv.appendChild(removeButton);
		achatDiv.appendChild(controleDiv);
		
		const achatsDiv = document.querySelector(".achats");
		achatsDiv.appendChild(achatDiv);
	}
	
	// Mettre à jour le montant total
	updateCartTotal();
}


/**
* Supprime un produit du panier
* @param {number} index - l'indice du produit à supprimer du panier
*/
const removeProductFromCart = function (index) {
	// Supprimer l'élément div.achat correspondant au produit
	const cartItem = document.getElementById(index + "-achat");
	if (cartItem) {
		cartItem.remove();
	}
	
	// Mettre à jour le total
	updateCartTotal();
}


/**
* Met à jour le total du panier en parcourant tous les articles
*/
const updateCartTotal = function () {
	total = 0;
	const allCartItems = document.querySelectorAll(".achat");
	allCartItems.forEach(function(item) {
		const itemQty = parseInt(item.querySelector(".quantite").value);
		const itemPrice = parseInt(item.querySelector(".prix").textContent);
		total += itemQty * itemPrice;
	});
	
	updateTotal();
}




/**
* @todo Q10
*/
const filterDisplaidProducts = function () {
	// Récupérer le texte du filtre et le convertir en minuscules
	const filterText = document.getElementById("filter").value.toLowerCase();
	
	// Récupérer tous les produits de la boutique
	const allProducts = document.querySelectorAll(".produit");
	
	// Parcourir chaque produit
	allProducts.forEach(function(product) {
		// Récupérer le nom du produit (dans le h4)
		const productName = product.querySelector("h4").textContent.toLowerCase();
		
		// Vérifier si le nom contient le texte du filtre
		if (productName.includes(filterText)) {
			// Afficher le produit
			product.style.display = "inline-block";
		} else {
			// Masquer le produit
			product.style.display = "none";
		}
	});
}


// ====================  Exécuter l'initialisation ======================= 
/*Q1*/
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM entièrement chargé !");
    init(); // Ce qui permet le chargement de la page HTML 
});
console.log(document.readyState); // Vérification du chargement du DOM 
//("loading" not OK; "interactive" ou "loaded": OK)

