'use strict';

$(document).ready(() => {
  $('body').css('opacity', 1);
})

var app = angular.module('app', []);

app.controller('ctrl', ['$rootScope', '$scope', '$interval', 'animation', 'task', 'data', function($rootScope, $scope, $interval, animation, task, data){
  $scope.products = data.products;
  $rootScope.itemTracker = 0;
  $rootScope.cartQuantity = 0;
  $rootScope.individualItemsInShoppingCart = [];
  $rootScope.shoppingCartItems = [];
  $rootScope.uniqueItemIDs = [];
  $rootScope.cartIndex = 0;
  $scope.incrementCartItem = (item) => {
    task.increment(item);
  }
  $scope.decrementCartItem = (item) => {
    task.decrement(item);
  }
  $scope.removeItemFromShoppingCart = (item) => {
    task.removeItemFromShoppingCart(item);
  }

  $scope.toggleCloseView = (open) => {
    const left = (open === true) ? '0%' : '100%';
    $('#closeViewer').css('left', left);
  }
  $scope.addToCart = (data, product, e) => {
    $rootScope.itemTracker++;
    const uniqueID = product.img + $rootScope.itemTracker;
    animation.addToCart(data, product, uniqueID);
  }
  task.keepUpdated();
}]);

app.service('animation', function($rootScope, task){
  this.addToCart = (data, product, uniqueID) => {
    $rootScope.clickTracker++;
    // const tracker = $rootScope.clickTracker + product.img;
    const $productContainer = $('.itemContainer[data="' + data + '"]');
    const productContainerHeight = $productContainer.height();
    const productContainerWidth = $productContainer.width();

    //find target position
    const cartPostion = $('#cart').position();
    //shrink height and width
    const height = '1.6em';
    const width = '1.2em';

    //add clone img to page
    let movingImg = '';
    movingImg += '<div class="cartImgHolder movingImg">';
    movingImg += '<img src="' + product.img + '">';
    movingImg += '</div>';
    $('html').append(movingImg);

    const selfPosition = $productContainer.offset();
    //position clone img
    const $clone = $('.movingImg');
    $clone.css('position', 'absolute')
          .css('top', selfPosition.top)
          .css('left', selfPosition.left)
          .css('height', productContainerHeight)
          .css('width', productContainerWidth)
          .css('z-index', 10);

    //if the shopping cart drop needs adjustments chang the dx and dy
    const dx = 4;
    const dy = -20;

    const left = cartPostion.left + dx;
    const top = cartPostion.top + dy;
    const inBag = top + 20;

    const animation = { left: left, top: top, height: height, width: width }
    const animation2 = { top: inBag, opacity: 0 }
    const options2  = { complete: function(){
      const item = { name: product.name, img: product.img, price: product.price}
      task.addToShoppingCart(item, uniqueID);
    }}
    const complete = () => {
      $clone.animate(animation2, options2);
    }
    const options = { duration: 1000, complete }
    $clone.animate(animation, options);
  }
});

app.service('data', function(){
  this.products = [
    {
      name: "SWAG",
      img: "./img/item1.png",
      "price": "$60",
      description: "get you swag while it's hot"
    },
    {
      name: "SWAG",
      img: "./img/item2.png",
      "price": "$60",
      description: "get you swag while it's hot"
    },
    {
      name: "SWAG",
      img: "./img/item3.png",
      "price": "$60",
      description: "get you swag while it's hot"
    },
    {
      name: "SWAG",
      img: "./img/item4.png",
      "price": "$60",
      description: "get you swag while it's hot"
    },
    {
      name: "SWAG",
      img: "./img/item5.png",
      "price": "$60",
      description: "get you swag while it's hot"
    },
    {
      name: "SWAG",
      img: "./img/item6.png",
      "price": "$60",
      description: "get you swag while it's hot"
    },
    {
      name: "SWAG",
      img: "./img/item7.png",
      "price": "$60",
      description: "get you swag while it's hot"
    },
    {
      name: "SWAG",
      img: "./img/item8.png",
      "price": "$60",
      description: "get you swag while it's hot"
    }
  ]
});

//task service
app.service('task', function($rootScope, $interval, $timeout){
  this.decrement = (item) => {
    let arrayIndex;
    const index = this.findIndexInArrayByIndex(item.index, $rootScope.shoppingCartItems);
    $rootScope.shoppingCartItems[index].quantity--;
    $rootScope.itemTracker--;
    if($rootScope.shoppingCartItems[index].quantity === 0){
      $rootScope.shoppingCartItems.splice(index, 1);
      $rootScope.individualItemsInShoppingCart.map((img, i) => {
        if(img === item.img){
          arrayIndex = i;
        }
      })
      $rootScope.individualItemsInShoppingCart.splice(arrayIndex, 1);
    }
    this.adjustCartQuantity();
  }
  this.increment = (item) => {
    const index = this.findIndexInArrayByIndex(item.index, $rootScope.shoppingCartItems);
    $rootScope.shoppingCartItems[index].quantity++;
    $rootScope.itemTracker++;
    this.adjustCartQuantity();
  }
  this.findIndexInArrayByIndex = (index, parentArray) => {
    let foundIndex = 'not found';
    parentArray.map((item, i) => {
      if(item.index == index){
        foundIndex = i;
      }
    })
    return foundIndex;
  }
  this.findItemInArrayByIndex = (index, parentArray) => {
    let foundIndex = 'not found';
    parentArray.map((item, i) => {
      if(item.index == index){
        foundIndex = item;
      }
    })
    return foundIndex;
  }
  this.addToShoppingCart = (item, uniqueID) => {
    const inCart = $rootScope.uniqueItemIDs.includes(uniqueID);
    if(inCart){ return null }
    $rootScope.uniqueItemIDs.push(uniqueID);
    const isInShoppingCart = $rootScope.individualItemsInShoppingCart.includes(item.img);
    if(isInShoppingCart){
      $rootScope.shoppingCartItems.map((shoppingCartItem) => {
        if(shoppingCartItem.img === item.img){
          shoppingCartItem.quantity++;
        }
      })
    } else {
      const img = item.img;
      const price = item.price;
      const name = item.name;
      const imgObj = { name: name, img: img, price: price, quantity: 1, index: $rootScope.cartIndex }
      $rootScope.cartIndex++;
      $rootScope.shoppingCartItems.push(imgObj);
      $rootScope.individualItemsInShoppingCart.push(img);
    }
    this.adjustCartQuantity();
  }
  this.adjustCartQuantity = () => {
    $rootScope.cartQuantity = this.getTotalItemsInCart($rootScope.shoppingCartItems);
    $('#cartQuantity').text($rootScope.cartQuantity);
  }
  this.removeItemFromShoppingCart = (item) => {
    let arrayIndex;
    let quantity;
    const index = this.findIndexInArrayByIndex(item.index, $rootScope.shoppingCartItems);
    $rootScope.shoppingCartItems.splice(index, 1);
    $rootScope.individualItemsInShoppingCart.map((img, i) => {
      if(img === item.img){
        quantity = item.quantity;
        arrayIndex = i;
      }
    })
    $rootScope.individualItemsInShoppingCart.splice(arrayIndex, 1);
    $rootScope.itemTracker -= quantity;
    this.adjustCartQuantity();
  }
  this.checkoutItemsTotal = () => {
    const calculateTotal = () => {
      let total = 0;
      $rootScope.shoppingCartItems.map((item) => {
        const price = item.price.substring(1, item.price.length);
        total += (parseInt(price) * parseInt(item.quantity));
      })
      $rootScope.checkoutItemsTotal = total;
    }
    $interval(() => {
      calculateTotal();
    })
  }
  this.getTotalItemsInCart = (shoppingCart) => {
    let totalItems = 0;
    shoppingCart.map((data) => {
      totalItems += data.quantity;
    })
    return totalItems;
  }
  this.keepUpdated = () => {
    $interval(() => {
      $rootScope.shoppingCartItems = $rootScope.shoppingCartItems;
    })
  }
});
