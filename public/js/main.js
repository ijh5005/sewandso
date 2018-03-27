'use strict';

var app = angular.module('app', []);

app.controller('ctrl', ['$scope', '$rootScope', '$interval', '$timeout', 'animate', 'task', 'data', function($scope, $rootScope, $interval, $timeout, animate, task, data){
  //ROOT VARIABLES
  $rootScope.splashLoaderWidth = 0;
  $rootScope.productGallerySmallImgs = [];
  $rootScope.cartIDs = [];
  $rootScope.cart = [];
  $rootScope.cartQuantity = 0;
  $rootScope.navigating = true;

  //SCOPE VARIABLES
  $scope.products = data.products;
  $scope.showProductGallery = false;
  $scope.navOptions = data.navOptions;
  $scope.currentPage = 'HOME';

  //METHODS
  $scope.addToCartFromGallery = (index) => {
    animate.addToCartFromGallery(data.products[index], index);
    task.addToCart(data.products[index]);
    $timeout(() => {
      task.calculateCartQuantity();
    }, 500)
  }
  $scope.addToCartFromProductView = () => {
    task.addToCart($rootScope.productViewProduct);
    $timeout(() => {
      task.calculateCartQuantity();
    })
  }
  $scope.toggleProductGallery = (index) => {
    $scope.showProductGallery = !$scope.showProductGallery;
    //wait for the ui to load to set the gallery info
    $timeout(() => {
      task.setProductGalleryData(data['products'][index]);
      $rootScope.productViewProduct = data['products'][index];
    })
  }
  $scope.setLargerGalleryImg = (index) => {
    task.setLargerGalleryImg($rootScope.productGallerySmallImgs[index]);
  }
  $scope.navigateTo = (navOption, index) => {
    $('.navOptions').removeClass('active');
    $('.navOptions[data="' + index + '"]').addClass('active');
    $scope.currentPage = navOption;
    if(navOption === 'CART'){
      $timeout(() => {
        runStripe();
      })
    }
  }
  $scope.changeViewFrom = (view) => {
    task.switchViews(view)
  }

  //INIT TASKS
  task.startSplash(data.products);
  task.assignIDsToProducts(data.products);
  task.initalSetup();
}]);

app.service('animate', function($rootScope, $interval, $timeout){
  this.addToCartFromGallery = (product, index) => {
    const $productBox = $('.productBox[data="' + index + '"]');
    //get the location of the added item picture
    const offset = $productBox.offset();
    const left = offset.left;
    const top = offset.top;
    //get the width and height of the picture
    const width = $productBox.width();
    const height = $productBox.height();
    //append a div to the body
    $('body').append('<div class="clone"></div>');
    //relocate the append div
    const $clone = $('.clone');
    $clone.css('position', 'absolute')
          .css('top', top).css('left', left)
          .css('backgroundImage', 'url(' + product.img + ')')
          .css('backgroundSize', '100% 100%')
          .css('zIndex', 20)
          .css('transition', 'opacity 0.5s')
          .height(height)
          .width(width);
    //get the position of the cart
    const cartOffsetTop = $('#cartIcon').offset().top;
    const cartOffsetLeft = $('#cartIcon').offset().left;
    const shrinkSizeHeight = '1.4em';
    const shrinkSizeWidth = '1em';
    //move the div to the shopping cart
    $clone.animate({
      top: cartOffsetTop,
      left: cartOffsetLeft,
      height: shrinkSizeHeight,
      width: shrinkSizeWidth
    }, {
      duration: 1000,
      start: function(){
        $timeout(() => {
          $clone.css('opacity', 0);
        }, 800)
      },
      complete: function(){
        $clone.remove();
      }
    });
  }
})

app.service('task', function($rootScope, $interval, $timeout){
  this.startSplash = (products) => {
    //cacha the splash dom element
    const $splash = $('#splash');
    //if there exist no splah screen skip
    if(!$splash.length){
      return null;
    }
    //wait for UI to load
    $timeout(() => {
      //fade in the splash screen
      $splash.css('opacity', 1);
      //animate the loader
      $rootScope.splashLoaderWidth = 100;
    }, 250).then(() => {
      $timeout(() => {
        //change the body background-color to white
        $('body').css('backgroundColor', '#fff');
        //fadeout the splash screen
        $splash.css('opacity', 0);
        //display the home page
        $('#container').removeClass('none');
        $timeout(() => {
          //remove the splash screen
          $splash.hide();
        }, 500);
      }, 1500);
    })
  }
  this.assignIDsToProducts = (products) => {
    products.map((data, index) => {
      data['id'] = index;
    })
  }
  this.setProductGalleryData = (product) => {
    //set larger img in product gallery
    this.setLargerGalleryImg(product.img);
    //set smaller imgs in product gallery
    this.setSmallerGalleryImgs(product.galleryImgs);
    //set product text
    this.setProductGalleryText(product);
  }
  this.setLargerGalleryImg = (img) => {
    document.getElementById('bigImgInGallery').style.backgroundImage = 'url("' + img + '")';
  }
  this.setSmallerGalleryImgs = (galleryImgs) => {
    galleryImgs.map((img, index) => {
      $rootScope.productGallerySmallImgs[index] = img;
      document.getElementById('img' + index).style.backgroundImage = 'url("' + img + '")';
    })
  }
  this.setProductGalleryText = (product) => {
    const test = document.getElementById('descriptionName');
    document.getElementById('descriptionName').innerText = product['name'];
    document.getElementById('descriptionPrice').innerText = product['price'];
    document.getElementById('descriptionDescription').innerText = product['description'];
  }
  this.addToCart = (product) => {
    ($rootScope.cartIDs.includes(product.id)) ? this.addAnotherToCart(product) : this.addOnlyOneToCart(product);
  }
  this.addAnotherToCart = (product) => {
    const id = product['id'];
    $rootScope.cart.map((product, index) => {
      if(product['id'] === id){
        $rootScope.cart[index]['quantity']++;
      }
    })
  }
  this.addOnlyOneToCart = (product) => {
    $rootScope.cartIDs.push(product.id);
    product['quantity'] = 1;
    $rootScope.cart.push(product);
  }
  this.calculateCartQuantity = () => {
    let quantity = 0;
    $rootScope.cart.map((product) => {
      quantity += parseInt(product.quantity);
    })
    $rootScope.cartQuantity = quantity;
  }
  this.initalSetup = () => {
    //wait until the UI loads
    $timeout(() => {
      //set the inital navigation option
      $('.navOptions[data="0"]').addClass('active');
    })
  }
  this.switchViews = (view) => {
    const addClassTo = (view === 'smallGalleryViewBox') ? '.smallGalleryViewBox' : '.largeGalleryViewBox';
    const removeClassFrom = (view === 'smallGalleryViewBox') ? '.largeGalleryViewBox' : '.smallGalleryViewBox';
    $(removeClassFrom).removeClass('activeView');
    $(addClassTo).addClass('activeView');
  }
});

app.service('data', function(){
  this.products = [
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },
    {
      name: 'black and sexy',
      price: '$45',
      img: './img/fashion.png',
      galleryImgs: ['./img/fashion.png', './img/fashion2.png', './img/fashion3.png', './img/fashion4.png'],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante elit, facilisis ut commodo eget, iaculis at nibh.'
    },

  ];
  this.navOptions = ['HOME', 'ABOUT', 'SHOP', 'LESSONS', 'CONTACT', 'CART'];
});
