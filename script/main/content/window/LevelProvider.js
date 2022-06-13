const LevelProvider = {};

LevelProvider.attach = function() {
	let overlay = new OverlayWindow();
	this.overlay = overlay;
};

LevelProvider.getOverlayWindow = function() {
	return this.overlay || null;
};

LevelProvider.isAttached = function() {
	return this.getOverlayWindow() !== null;
};

LevelProvider.getFormattedTps = function() {
	let tps = preround(TPSMeter.getTps(), 1);
	if (tps < .1 || tps >= 1000) return "0.0";
	return new java.lang.Float(tps);
};

LevelProvider.update = function() {
	let overlay = this.getOverlayWindow();
	if (overlay === null) return false;
	if (!thereIsNoTPSMeter) {
		let tps = this.getFormattedTps(); // 20.0
		overlay.setText(Updatable.getSyncTime() + " / " + translate("%stps", tps) + " / " + Math.ceil((java.lang.Runtime.getRuntime().totalMemory() - java.lang.Runtime.getRuntime().freeMemory()) / 1048576) + "MiB");
		return true;
	}
	return false;
};

LevelProvider.updateRecursive = function() {
	let instance = this;
	handle(function() {
		if (instance.update() && LevelInfo.isLoaded()) {
			instance.updateRecursive();
		}
	}, 50);
};

LevelProvider.show = function() {
	let overlay = this.getOverlayWindow();
	if (overlay === null) return;
	if (this.update()) {
		overlay.show();
		this.updateRecursive();
	}
};

LevelProvider.hide = function() {
	let overlay = this.getOverlayWindow();
	if (overlay === null) return;
	overlay.hide();
};

Callback.addCallback("LevelLoaded", function() {
	handle(function() {
		if (LevelProvider.isAttached()) {
			LevelProvider.show();
		}
	});
});

Callback.addCallback("LevelLeft", function() {
	handle(function() {
		if (LevelProvider.isAttached()) {
			LevelProvider.hide();
		}
	});
});

let thereIsNoTPSMeter = false;

tryoutSafety.call(this, function() {
	let TPSMeter = INNERCORE_PACKAGE.api.runtime.TPSMeter;
	this.TPSMeter = new TPSMeter(20, 1000);
}, function(e) {
	showHint(translate("Couldn't create engine TPS Meter"));
	thereIsNoTPSMeter = true;
});

Callback.addCallback("tick", function() {
	tryoutSafety(function() {
		if (!thereIsNoTPSMeter) {
			TPSMeter.onTick();
		}
	});
});
