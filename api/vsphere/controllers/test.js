var vs = require('./vSphere')
var ctx = { 'params' : { 'type' : 'ResourcePool' } } 
var pools = vs.get(ctx)
console.log(pools)
var ctx = { 'params' : { 'type' : 'ClusterComputeResource' } } 
var pools = vs.get(ctx)
console.log(pools)
