var _ = require("lodash");
var parallelBatch = require("../lib/parallel-batch.js");

describe("parallel-batch", function() {
	it("runs a single batch when the batch size is larger than the array size", function(done) {
		var iterator = jasmine.createSpy("iterator").and.callFake(function(batch, callback) {
			callback(null, batch.length);
		});
		
		var arr = createArray(100);
		
		parallelBatch(arr, 1000, iterator, function(error, results) {
			expect(results.length).toEqual(1);
			expect(results[0]).toEqual(100);
			expect(iterator.calls.count()).toEqual(1);
			done();
		});
	});
	
	it("runs a couple of batches when the batch size is smaller than the array size", function(done) {
		var iterator = jasmine.createSpy("iterator").and.callFake(function(batch, callback) {
			callback(null, batch.length);
		});
		
		var arr = createArray(100);
		
		parallelBatch(arr, 20, iterator, function(error, results) {
			expect(results.length).toEqual(5);
			expect(results[0]).toEqual(20);
			expect(iterator.calls.count()).toEqual(5);
			done();
		});
	});
	
	it("runs a couple of batches and the last batch is smaller if the array doesn't fit neatly into the batch size", function(done) {
		var iterator = jasmine.createSpy("iterator").and.callFake(function(batch, callback) {
			callback(null, batch.length);
		});
		
		var arr = createArray(105);
		
		parallelBatch(arr, 20, iterator, function(error, results) {
			expect(results.length).toEqual(6);
			expect(results[0]).toEqual(20);
			expect(results[5]).toEqual(5);
			expect(iterator.calls.count()).toEqual(6);
			done();
		});
	});
	
	it("returns an empty results array if the original array was empty", function(done) {
		var iterator = jasmine.createSpy("iterator").and.callFake(function(batch, callback) {
			callback(null, batch.length);
		});
		
		var arr = [];
		
		parallelBatch(arr, 20, iterator, function(error, results) {
			expect(results.length).toEqual(0);
			expect(iterator.calls.count()).toEqual(0);
			done();
		});
	});
	
	it("returns an error if the first iterator returns an error", function(done) {
		var first = true;
		
		var iterator = jasmine.createSpy("iterator").and.callFake(function(batch, callback) {
			if(first) {
				callback("error");
				first = false;
				return;
			}
			callback(null, batch.length);
		});
		
		var arr = createArray(105);
		
		parallelBatch(arr, 20, iterator, function(error, results) {
			expect(error).toEqual("error");
			done();
		});
	});
});

function createArray(n) {
	var arr = [];
	_.times(n, function() {
		arr.push("element");
	});
	return arr;
}
