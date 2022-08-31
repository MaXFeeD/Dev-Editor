var EntityAIAttack = {};
EntityAIAttack.getDefaultPriority = function() {
	return 1;
};
EntityAIAttack.getDefaultName = function() {
	return "basic-entity-ai";
};
EntityAIAttack.params = {};
EntityAIAttack.params.attack_damage = 5;
EntityAIAttack.params.attack_range = 2.5;
EntityAIAttack.params.attack_rate = 12;
EntityAIAttack.setParams = function(params) {};
EntityAIAttack.executionStarted = function() {};
EntityAIAttack.executionEnded = function() {};
EntityAIAttack.executionPaused = function() {};
EntityAIAttack.executionResumed = function() {};
EntityAIAttack.execute = function() {};
EntityAIAttack.__execute = function() {};
EntityAIAttack.setExecutionTimer = function(timer) {};
EntityAIAttack.removeExecutionTimer = function() {};
EntityAIAttack.data = {};
EntityAIAttack.data.timer = 0;
EntityAIAttack.data.target = null;
EntityAIAttack.data.executionTimer = -1;
EntityAIAttack.isInstance = false;
EntityAIAttack.parent = null;
EntityAIAttack.entity = null;
EntityAIAttack.instantiate = function(parent, name) {
	return null;
};
EntityAIAttack.aiEntityChanged = function(entity) {};
EntityAIAttack.finishExecution = function() {};
EntityAIAttack.changeSelfPriority = function(priority) {};
EntityAIAttack.enableAI = function(name, priority, extra) {};
EntityAIAttack.disableAI = function(name) {};
EntityAIAttack.setPriority = function(name, priority) {};
EntityAIAttack.getAI = function(name) {};
EntityAIAttack.getPriority = function(name) {};
EntityAIAttack.attackedBy = function(entity) {};
EntityAIAttack.hurtBy = function(entity) {};
EntityAIAttack.projectileHit = function(projectile) {};
EntityAIAttack.death = function(entity) {};
