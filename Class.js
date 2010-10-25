/*
The MIT License

Copyright (c) 2010 Zohaib Sibt-e-Hassan(MaXPert)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Class = function(){
    var slice = Array.prototype.slice,
        args = slice.call(arguments),
        parent = null,
        defina = null,
        init = null,
        privates = null,
        publics = null;
        
    
    var merge = function(a, b){
		var i;
        if(b.length !== undefined && a.length !== undefined){
            for(i=0;i<b.length;i++){
                a[a.length]=b[i];
            }
        }else if(typeof a == 'object' && typeof b == 'object'){
            for(i in b){
                if(b.hasOwnProperty(i)){
                    a[i]=b[i];
                }
            }
        }
    };
    
    var glue = function(){
        var oa = slice.call(arguments),
            func = oa.shift(),
            obj = oa.shift();
        return function(){
            var ia = slice.call(arguments),
                ar = [];
            merge(ar, oa);
            merge(ar, ia);
            func.apply(obj, ar);
        };
    };
	
	var bound = function(b, ob){
        var reta = {}; 
		merge(reta, b);
		for(var m in b) {
			if(b.hasOwnProperty(m) && typeof b[m] == 'function') {
				reta[m] = glue(b[m], ob);
			}
		}
		return reta;
    };
    
	
    if(args.length > 1){
        parent = args.shift();
		
    }
    
    defina = args.shift();
    publics = defina.Public || {};
    privates = defina.Private || {};
    init = defina.Init;
    
	
	//Assert checks
    if(typeof init != 'function'){
        throw 'Init constructor must be a function';
    }
	
	for(var m in publics){
		if(privates[m] !== undefined ){
			throw "Duplicate entry "+m+" in public and private member list";
		}
	}
    
    var klass = function(){
		var i;
		if(parent && parent.prototype){
			//Construct parent
			klass.prototype.$uper = {};
			merge(klass.prototype.$uper, parent.prototype);
			parent.apply(klass.prototype.$uper, arguments);
			
			//Inhert parent
			merge(this, klass.prototype.$uper);
			merge(this, bound(parent.prototype, klass.prototype.$uper));
		}
		
		//Create a VTable including publics and privates
		var vis = {};
		
		//Create VTable call for function
		var vtablize = function(func){
			return function(){
				//Call vtabled
				func.apply(vis, arguments);
				
				//Accept canges in VTable
				for(var p in vis){
					if(publics.hasOwnProperty(p) && vis.hasOwnProperty(p) && publics[p] !== vis[p]){
						this[p] = vis[p];
					}else if(privates.hasOwnProperty(p) && vis.hasOwnProperty(p) && privates[p] !== vis[p]){
						privates[p] = vis[p];
					}
				}
			};
		};
		
		//Overide inherted vtabled
		for(i in publics){
			if(publics.hasOwnProperty(i) && typeof publics[i] == 'function'){
				klass.prototype[i] = vtablize(publics[i]);
			}else if(publics.hasOwnProperty(i)){
				this[i] = publics[i];
			}
		}
		
		merge(vis, privates);
		merge(vis, this);
		
		init.apply(this, arguments);
	};
    
    return klass;
};
