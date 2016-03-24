//##############################################//
//					Level Class          		//
//                			            	   	//
//			© CAMERON CHALMERS, 2016	  		//
//##############################################//

function Character(id, name, gender, connectID) {
	this.characterID = id;
	this.currentID = connectID;
	this.name = name;
	this.gender = gender;
	this.charLevel = 1;
	//this.skills = [1, 1, 1, 1, 1];
	//Head chest gloves trousers boots
	this.clothes = [1, 1, 1, 1, 1];
	//this.weapon = weapon;
	this.inventory = [];
	//this.passiveSpells
	//this.statusEffects
	//this.spells
	this.levelID = 0;
	this.position = [];
}

//Functions
Character.prototype.getCurrentID = function() {
  return this.currentID;
}

Character.prototype.getLevelID = function() {
  return this.levelID;
}


//####################################################################

exports.Character = Character;