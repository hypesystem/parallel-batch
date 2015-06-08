var async = require("async");
var _ = require("lodash");

function parallelBatch(arr, batchSize, iterator, callback) {
	var batches = batch(arr, batchSize);
	var batchFunctions = mapBatchesToBatchIterators(batches, iterator);
	async.parallel(batchFunctions, callback);
}

function batch(arr, batchSize, resultingBatches) {
	if(!resultingBatches) {
		resultingBatches = [];
	}
	
	if(arr.length == 0) {
		return resultingBatches;
	}
	
	var nextBatch = _.take(arr, batchSize);
	resultingBatches.push(nextBatch);
	
	var remainder = _.drop(arr, batchSize);
	
	return batch(remainder, batchSize, resultingBatches);
}

function mapBatchesToBatchIterators(batches, iterator) {
	return _.map(batches, function(batch) {
		return function(callback) {
			iterator(batch, callback);
		};
	});
}

module.exports = parallelBatch;
