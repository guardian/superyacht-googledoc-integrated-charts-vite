export const charts = [{
	"type": "verticalbar",
	"names" : ["stackedbar","verticalbar"],
	"config" : {
		"axis" : [{
			"name" : "xColumn",
			"default" : 0
		},{
			"name" : "yColumn",
			"default" : 1
		}],
		"settings" : [{
			"name" : "stackedbars"
		}]

	}
}, {
	"type": "scatterplot",
	"names" : ["scatterplot"],
	"config" : {
		"axis" : [{
			"name" : "xColumn",
			"default" : 0
		},{
			"name" : "yColumn",
			"default" : 1
		},{
			"name" : "groupBy",
			"default" : 2
		}]
	}
}, {
	"type": "linechart",
	"names" : ["linechart"],
	"config" : {
		"axis" : [{
			"name" : "xColumn",
			"default" : 0
		}],
		"settings" : [{
			"name" : "chartlines"
		}]
	}
}, {
	"type": "horizontalbar",
	"names" : ["horizontalbar"],
	"config" : {
		"axis" : [{
			"name" : "yColumn",
			"default" : 0
		}],
		"settings" : [{
			"name" : "stackedhorizontal"
		}]
	}
}, {
	"type": "smallmultiples",
	"names" : ["smallmultiples"],
	"config" : {
		"axis" : [{
			"name" : "xColumn",
			"default" : 0
		},{
			"name" : "groupBy",
			"default" : 1
		}],
		"settings" : [{
			"name" : "smallmultiples"
		}]
	}
}, {
	"type": "stackedarea",
	"names" : ["stackedarea"],
	"config" : {
		"axis" : [{
			"name" : "xColumn",
			"default" : 0
		}],
		"settings" : [{
			"name" : "stackedbars"
		}]
	}
}, {
	"type": "table",
	"names" : ["table"],
	"config" : {}
}, {
	"type": "horizontalgroupedbar",
	"names" : ["groupedbar","horizontalgroupedbar"],
	"config" : {
		"axis" : [{
			"name" : "groupBy",
			"default" : 0
		}]
	}
}, {
	"type": "lollipop",
	"names" : ["lollipop"],
	"config" : {
		"axis" : [{
			"name" : "yColumn",
			"default" : 0
		}]
	}
},{
	"type": "bubble",
	"names" : ["bubble"],
	"config" : {
		"axis" : [{
			"name" : "xColumn",
			"default" : 0
		},{
			"name" : "yColumn",
			"default" : 1
		}]
	}
}]