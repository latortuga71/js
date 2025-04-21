function to_float64(low32bits,high32bits){
    let a = new ArrayBuffer(32);
    let i32low = new Int32Array(a); // 4 Bytes Each
    let i64high = new Float64Array(a); // 8 Bytes Each
    i32low[0] = low32bits; // lower 4 bytes
    i32low[1] = high32bits; // higher 4 bytes
    return i64high[0]; // returns the two parts combined
}

let res = to_float64(0x45464748, 0x41424344) // Don't forget about endianness!!

console.log(res);

// different ways to complete objective of calling win when passed an obj
/* PROXY EXAMPLE
let obj = {win: 1};
let objp = new Proxy(obj, {
    deleteProperty: function(obj, prop) {
        return false;
    }
});
*/

function quiz(obj) {
    for (let name of Object.keys(obj)) {
      delete obj[name];
    }
    if (obj.win) {
      win('You win!');
    } else {
      console.log('You lose...');
    }
  }

// PROTO EXAMPLE
/*
payload = {};
payload.__proto__ = {win:1}
payload.__proto__.win = 1
quiz(payload);
*/

// configure object example

/*

let obj = {};
Object.defineProperty(obj, 'win', {value:true, configurable:false})
quiz(obj); // You win!

*/