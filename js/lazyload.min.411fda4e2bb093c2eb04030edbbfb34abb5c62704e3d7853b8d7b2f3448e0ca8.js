/*!
 * Lazy Load - JavaScript plugin for lazy loading images
 *
 * Copyright (c) 2007-2017 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   https://appelsiini.net/projects/lazyload
 *
 * Version: 2.0.0-beta.2
 *
 */(function(e,t){typeof exports=="object"?module.exports=t(e):typeof define=="function"&&define.amd?define([],t(e)):e.LazyLoad=t(e)})(typeof global!="undefined"?global:this.window||this.global,function(e){"use strict";const s={src:"data-src",srcset:"data-srcset",selector:".lazyload",onLoaded:function(e){e.classList.add("loaded")}},n=function(){let e={},s=!1,t=0,o=arguments.length;Object.prototype.toString.call(arguments[0])==="[object Boolean]"&&(s=arguments[0],t++);let i=function(t){for(let o in t)Object.prototype.hasOwnProperty.call(t,o)&&(s&&Object.prototype.toString.call(t[o])==="[object Object]"?e[o]=n(!0,e[o],t[o]):e[o]=t[o])};for(;t<o;t++){let e=arguments[t];i(e)}return e};function t(e,t){this.settings=n(s,t||{}),this.images=e||document.querySelectorAll(this.settings.selector),this.observer=null,this.init()}if(t.prototype={init:function(){if(!e.IntersectionObserver){this.loadImages();return}let t=this,n={root:null,rootMargin:"0px",threshold:[0]};this.observer=new IntersectionObserver(function(e){e.forEach(function(e){if(e.intersectionRatio>0){t.observer.unobserve(e.target),e.target.onload=function(){t.settings.onLoaded(e.target)};let n=e.target.getAttribute(t.settings.src),s=e.target.getAttribute(t.settings.srcset);"img"===e.target.tagName.toLowerCase()?(n&&(e.target.src=n),s&&(e.target.srcset=s)):e.target.style.backgroundImage="url("+n+")"}})},n),this.images.forEach(function(e){t.observer.observe(e)})},loadAndDestroy:function(){if(!this.settings)return;this.loadImages(),this.destroy()},loadImages:function(){if(!this.settings)return;let e=this;this.images.forEach(function(t){t.onload=function(){e.settings.onLoaded(t)};let n=t.getAttribute(e.settings.src),s=t.getAttribute(e.settings.srcset);"img"===t.tagName.toLowerCase()?(n&&(t.src=n),s&&(t.srcset=s)):t.style.backgroundImage="url('"+n+"')"})},destroy:function(){if(!this.settings)return;this.observer.disconnect(),this.settings=null}},e.lazyload=function(e,n){return new t(e,n)},e.jQuery){const n=e.jQuery;n.fn.lazyload=function(e){return e=e||{},e.attribute=e.attribute||"data-src",new t(n.makeArray(this),e),this}}return t})