/*!
 * Phantom Net Namespace and Inheritance
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 * 
 * Inspired by Simple JavaScript Inheritance By John Resig http://ejohn.org/
 * Inspired by base2 and Prototype
 */

(function (window, document, undefined) {

    "use strict";

    if (window.GG !== undefined) {
        return;
    }

    ////////////////////////////////////////////////////////////////
    // namespace
    window.GG = {};
    var GG = window.GG;

    GG.namespace = function () {
        var a = arguments, o = null, i, j, d;
        for (i = 0; i < a.length; i++) {
            d = a[i].split(".");
            o = window;
            for (j = 0; j < d.length; j++) {
                o[d[j]] = o[d[j]] || {};
                o = o[d[j]];
            }
        }
        return o;
    };
 
    ////////////////////////////////////////////////////////////////
    // Class
    var _initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    var Class = function () { };
    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        _initializing = true;
        var prototype = new this();
        _initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] === "function" &&
                typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function NewClass() {
            // All construction is actually done in the init method
            if (!_initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        NewClass.prototype = prototype;

        // Enforce the constructor to be what we expect
        NewClass.prototype.constructor = NewClass;

        // And make this class extendable
        NewClass.extend = Class.extend;

        return NewClass;
    };

    GG.Class = Class;

})(window, document);
