/**
 * berliner-kaffeeroesterei.de
 */
function ccb() {
	// MEMBERS
	this.mahlgrad = "ungemahlen";/* defaultwert */
	this.ccb_id = 0;/* Mysql-ID ist zu setzen bei bereits vorhandenen Mischungen */
	this.gewicht = 1000;/* initial Wert - kann geändert werden */
	this.preis = 0;/* wird errechnet */
	this.preis_base = 250;/* basis-grammzahl */
	this.titel = "Kaffeename?";
	this.currentID = "";/* gerade bearbeitete-ID */
	this.s_id = new Array();/* Sorten-ID==ArtikelID */
	this.s_menge = new Array();/* Prozent-Wert */
	this.s_gewicht = new Array();/* Anteilsgewicht der Sorte */
	this.s_name = new Array();/* Sorten Name */
	this.s_preis = new Array();/* Sortenpreis */
	this.s_fix = new Array();/*
								 * boolscher wert - Anteil vor Veränderung
								 * schützen
								 */
	this.s_taste = new Array();/*
								 * Zahlenwert zwischen 1 und 5 - entspricht
								 * Bohnensystem im shop
								 */
	this.c_preis = new Array();/* current Preis... Preis pro Anteil */
	this.max_s = 10;/* maximale Anzahl Sorten*/
	this.tableheigth = 590;/*Höhe der Tabelle(Mühle)*/
	this.min_prozent = 5;
}
// METHODS
// //
ccb.prototype.init = function(c_id, c_gewicht, c_titel, c_mahlgrad) {
	// Wiederherstellung der Mischung bei Rückkehr auf die Seite
	this.ccb_id = (typeof c_id != 'number') ? 0 : c_id;
	this.gewicht = (typeof c_gewicht != 'number') ? this.gewicht : c_gewicht;
	this.titel = (typeof c_titel != 'string')? "Kaffeename?": c_titel;
	this.mahlgrad = (typeof c_mahlgrad != 'string')? "ungemahlen": c_mahlgrad;

};
// //
ccb.prototype.init_values = function(args) {
	// ID,name,preis,menge,taste
	// Wiederherstellung der Mischung bei Rückkehr auf die Seite
	if (args.length > 0) {
		for (var i = 0; i < args.length - 4; i++) {
			// erstes Element : 0
			this.s_id.push(args[i]);
			i++;
			this.s_name.push(args[i]);
			i++;
			this.s_preis.push(args[i]);
			i++;
			this.s_taste.push(parseInt(args[i]));
			// Element 3 (viertes!)
			i++;
			this.s_menge.push(parseInt(args[i]));
			// letztes Element 4 (fünftes!)
			this.s_gewicht.push(0);
			this.c_preis.push(0);
			this.s_fix.push(false);
		}

		this.recalc();
	}
};
// //
ccb.prototype.setmenge = function(m) {
	if (m > 0)
		this.gewicht = m;
	//while (this.get_summe() != 100)
		this.recalc();

	aktualisiere_alles();
}
// //
ccb.prototype.setmahlgrad = function(m) {
	this.mahlgrad = m;
	// this.recalc();
	aktualisiere_alles();
}
// //
ccb.prototype.fix = function(fID) {
	this.s_fix[this.geti(fID)] = true;
	this.currentID ="";
	aktualisiere_alles();
}
// //
ccb.prototype.unfix = function(fID) {
	this.s_fix[this.geti(fID)] = false;
	this.currentID ="";
	aktualisiere_alles();
}
// //
ccb.prototype.notthere = function(tID) {
	var tt = true;
	for (i = 0; i < this.s_id.length; i++) {
		if (this.s_id[i] == tID) {
			var tt = false;
		}
	}
	return tt;
};

// //
ccb.prototype.geti = function(ID) {
	var tut = true;
	var ka = 0;
	while (tut) {

		if (this.s_id[ka] == ID)
			tut = false;
		ka++;
		if (ka == (this.s_id.length + 1)) {
			tut = false;
			ka = 0;
		}
	}
	return ka - 1;
};

// //
ccb.prototype.allow_add = function() {
	if(this.s_id.length == this.max_s){
		alert("Es duerfen maximal " + this.max_s + " Kaffeesorten in einer\n Mischung enthalten sein.");
		return false;
	}
	
	if (this.s_id.length > 0) {
		
		var numNotFixed = 0;
		var notFixedPercentage = 100;
		var meanPercentage;
					
		for (var j = 0; j < this.s_id.length; j++) {
			if (this.s_fix[j]) {
				notFixedPercentage -= this.s_menge[j];
			} else {
				numNotFixed++;										
			}
		}
		
		if (numNotFixed == 0) {
			return false;
		}
		
		meanPercentage = Math.floor(notFixedPercentage / (numNotFixed + 1));
		
		if (meanPercentage >= this.min_prozent) {
			return true;
		} else {
			return false;
		}
		
	} else {
		return true;
	}
}

// //
ccb.prototype.gh = function(v_h) {
	cell=46;/*minimale Zellenhoehe */
	t_h = cell * this.s_id.length;
	t_h = this.tableheigth - t_h;
	hoehe= cell + Math.round(v_h / 100  * t_h);
	return hoehe;
}
//
ccb.prototype.free_amount = function(boo/*
										 * d=Durchschnitt m=Maximum
										 * a=SummeAllerFreienWerte t=freieTeile
										 */) {
	if (this.s_id.length > 1) {
		var anteile = 0;// Anteile = d
		var ges = 0;// gesamtwert = m
		var max = 0;
		for (var u = 0; u < this.s_id.length; u++) {
			if ((this.s_fix[u] == false) && (this.currentID != this.s_id[u])) {
				anteile++;
				if (this.s_menge[u] > max)
					max = this.s_menge[u];
				ges += this.s_menge[u];
			}// endif
		}// endfor
		if (boo == "d") {
			if (anteile > 0)
				var t = ges / anteile;
			return t;
		}
		if (boo == "m") {
			return max;
		}
		if (boo == "a") {
			return ges;
		}
		if (boo == "t") {
			return anteile;
		}
	}// endif
	return 0;
}
//
ccb.prototype.add_amount = function(ID, amo) {
	this.currentID = ID;
	pao = parseInt(amo);
	// Provisoriumsvar
	var fixit = false;
	var ji = this.geti(this.currentID);
	
	var notFreeAmount = 0;
	var freeAmount;
				
	for (var j = 0; j < this.s_id.length; j++) {
		if (j == ji || this.s_fix[j]) {
			notFreeAmount += this.s_menge[j];
		} else {
			notFreeAmount += this.min_prozent;										
		}
	}
	
	freeAmount = 100 - notFreeAmount;
	
	// alert(ji+"ist der index");
	if ((this.s_menge[ji] < (100 - this.min_prozent)) && (this.get_summe() == 100)
			&& (!this.s_fix[ji]) && (this.free_amount("m") > amo) && (freeAmount > 0)) {
		this.s_menge[ji] += pao;
		// Provisorium mit FIX
		this.s_fix[ji] = true;
		fixit = true;
	}
	while (this.get_summe() != 100)
		this.recalc();

	// zum Provisorium
	if (fixit)
		this.s_fix[ji] = false;
	// alert(this.get_summe()+"summe nach test++");

}
//
ccb.prototype.sub_amount = function(ID, amo) {
	pao = parseInt(amo);
	// Provisoriumsvar
	var fixit = false;
	this.currentID = ID;
	var ji = this.geti(this.currentID);
	// alert(ji+"ist der index");
	
	if (this.s_menge[ji] > this.min_prozent) {
		if ((this.s_menge[ji] < 100) && (this.s_menge[ji] > pao)
				&& (this.get_summe() == 100) && (!this.s_fix[ji])) {
			this.s_menge[ji] -= pao;
	
			// Provisorium mit FIX
			this.s_fix[ji] = true;
			fixit = true;
			// alert(this.s_menge[ji]+" inside level");
		}
		while (this.get_summe() != 100)
			this.recalc();
		// alert('sub_done');
		// zum Provisorium
		if (fixit)
			this.s_fix[ji] = false;
	}

}

ccb.prototype.set_amount = function(ID, amo) {
	
	pao = parseInt(amo);
	var ji = this.geti(ID);
	
	var notFreeAmount = 0;
	var freeAmount;
				
	for (var j = 0; j < this.s_id.length; j++) {
		if (ji != j) {
			if (this.s_fix[j]) {
				notFreeAmount += this.s_menge[j];
			} else {
				notFreeAmount += this.min_prozent;										
			}
		}
	}
	
	freeAmount = 100 - notFreeAmount;
	
	if (pao < this.min_prozent) {
		pao = 5;
	} else if (pao > freeAmount) {
		pao = freeAmount;
	} 
	
	this.s_menge[ji] = pao;
	this.s_fix[ji] = true;
	this.recalc();
	this.s_fix[ji] = false;	
}

// //
ccb.prototype.get_new_amount = function(py) {
	if (isNaN(py))
		py = 0;
	var merk = 0;
	var zahl = py;
	for (var i = 0; i < (this.s_id.length - py); i++) {
		if (!this.s_fix[i]) {
			merk += this.s_menge[i]
			zahl++;
		}
	}
	if (zahl != 0)
		merk = merk / zahl;
	else
		merk = 0;
	merk = Math.floor(merk);
	return merk;
}

// //
ccb.prototype.add_sorte = function(ID, name, preis, taste) {
	this.currentID = ID;
	if (this.notthere(ID) && this.allow_add()) {
		this.s_id.push(ID);
		// value ermitteln!
		var value = this.get_new_amount(1);
		this.s_menge.push(value);
		this.s_gewicht.push(0);
		this.s_name.push(name);
		this.s_preis.push(parseFloat(preis));
		this.s_taste.push(parseInt(taste));
		this.c_preis.push(0);
		this.s_fix.push(true);
		//while (this.get_summe() != 100)
			this.recalc();
		this.s_fix[this.geti(ID)] = false;
		set_added(this.currentID);
		return true;
	}
};
// //
ccb.prototype.get_summe = function() {
	// alle s_menge addiert
	var delta = 0;
	for (ide = 0; ide < this.s_id.length; ide++) {
		delta = delta + this.s_menge[ide];
	}
	return delta;
}
// //
ccb.prototype.recalc = function() {
	if (this.s_id.length > 0) {
		
		var numNotFixed = 0;
		var notFixedPercentage = 100;
		var meanPercentage;
		var restPercentage;
		
		if (this.s_id.length >= 2) {			
			for (var j = 0; j < this.s_id.length; j++) {
				if (this.s_fix[j]) {
					notFixedPercentage -= this.s_menge[j];
				} else {
					numNotFixed++;										
				}
			}
			
			meanPercentage = Math.floor(notFixedPercentage / numNotFixed);
			restPercentage = notFixedPercentage % numNotFixed;
		}

		for (var i = 0; i < this.s_id.length; i++) {
			if (this.s_id.length == 1) {
				this.s_menge[i] = 100;
				
			} else {							
				if (!this.s_fix[i]) {
					this.s_menge[i] = meanPercentage;
					if (restPercentage > 0) {
						this.s_menge[i]++;
						restPercentage--;
					}
				}	
			}

			var rohpreis = (Math.round(this.s_menge[i] / 100 * this.s_preis[i] * 10000)) / 10000;
			this.c_preis[i] = rohpreis;
			this.s_gewicht[i] = Math.round(this.gewicht / 100 * this.s_menge[i]);
		}
	}
}

ccb.prototype.get_faktor = function(strii) {
	if (this.s_id.length == 1) {
		return 0;
	} else {
		var summe = 100 - this.get_summe();// <0 wenn summe > 100
		// >0 wenn summe < 100
		//if (Math.abs(summe) > 100 ){ alert (this.get_summe());}
		var teile = 0;
		for (var d = 0; d < this.s_id.length; d++) {
			if (!this.s_fix[d])
				teile++;
		}

		if (teile > 0) {
			if (strii == "mod") {
				var modulq = summe % teile;
				return modulq;
			} else if (strii == "fak") {
				if (summe > 0)
					summe = Math.floor(summe / teile);
				else
					summe = Math.ceil(summe / teile);
				return summe;
			}
		} else {
			return 0;
		}

	}
};
// //
ccb.prototype.del_item = function(ID) {
	this.currentID = ID;
	var laenge = this.s_id.length;
	for (var j = 0; j < laenge; j++) {
		if (this.s_id[0] != ID) {
			this.s_id.push(this.s_id.shift());
			this.s_menge.push(this.s_menge.shift());
			this.s_gewicht.push(this.s_gewicht.shift());
			this.s_name.push(this.s_name.shift());
			this.s_taste.push(this.s_taste.shift());
			this.s_preis.push(this.s_preis.shift());
			this.c_preis.push(this.c_preis.shift());
			this.s_fix.push(this.s_fix.shift());
		} else {
			this.s_id.shift();
			this.s_menge.shift();
			this.s_gewicht.shift();
			this.s_name.shift();
			this.s_taste.shift();
			this.s_preis.shift();
			this.c_preis.shift();
			this.s_fix.shift();

		}
		set_deleted(ID);
	}
	// wenn nach Löschen ein Loch entsteht
	if (!(this.allow_add())) {
		for (var ru = 0; ru < this.s_id.length; ru++)
			this.s_fix[ru] = false;
	}

	this.recalc();
	aktualisiere_alles();
	// return true;
}
// //
ccb.prototype.make_html = function() {
	if (this.s_id.length == 0) {
		tableheight = 310;
		shub=0;
		mBg = "images/newbkr/muehle-schublade.png";
	} else {
		tableheight = this.tableheigth;
		shub=115;
		mBg = "images/newbkr/muehle-schublade2.png";
	}

	// 2.
	var wrap_open = "<div id=\"muehle\" name='muehle' class=\"grid_8 alpha omega\" style=\"height: " + (tableheight + shub) + '; background-image: url(\'' + mBg + '\');">'
			+ "\n<!- --------------------HEAD------------------------------ ->\n";
			
	// 1.
	// var ausgabe = "<form name='sorts' action='ccb-app.php?salve=1"+add_req+"' method='post' onsubmit='return sendertest()'>"			uncomment in final version
	var ausgabe = "<form name='sorts' action='ccb-app.php?salve=1"+add_req+"' method='post' onsubmit='return check_name()'>";			// and delete this one
		ausgabe	+= (this.s_id.length == 0) ? '' : '<div id="muehleVoll" style="width: 243px; height: 50px; position: absolute; top: -48px; left: 100px; background-image: url(\'images/newbkr/BKR_kaffeebohnen_haufen.png\');"></div>';
		ausgabe	+= "<div class=\"grid_8 alpha omega\" style=\"height: 164px; background: url('images/newbkr/muehle-top.png') no-repeat; background-position: 24px 0px;\">"
			+ '<input type="text" maxlength="40" name="ccb_name" value="'+this.titel+'" onchange="set_name()" '
			+ 'style="border-width: 0px; border-color: #FFAAAA; color: #3399FF; font-size: 13px; font-weight: bold; width: 180px; text-align:center; position: relative; top: 125px; left: 140px;">'		
			+ "</div>\n<!-- switch -->\n" + wrap_open;

	if (this.s_id.length == 0) {
		ausgabe += "\n\n<!- inner Table ->\n<table width='360' height='"
				+ tableheight
				+ "' style='table-layout:fixed;	border:0px #633000 solid;"
				+ "padding:0px;margin0px;border-collapse:collapse;min-width:320px;max-height:"
				+ tableheight + "px;'>\n";// hier
		ausgabe += "<tr><td height='195' style='color: #FFFFFF; text-align: center; vertical-align: middle;"
				+ "'><b style='color: #EC7F00;'>Keine Kaffees ausgewählt</b><br />"
				+ "<b style='color: #3399FF'>W&auml;hlen Sie mindestens 2 Kaffeesorten aus der Liste links und geben Sie diese &uuml;ber den Plus-Button in die M&uuml;hle.</b></td></tr>"
				+ '<tr><td height="115" style="padding: 0; margin: 0; border: 0px;">'
				+ '<div class="grid_3" style="padding: 9px 0 0 5px;">'
				+ "<select name='gewicht' size='1' style='width: 90px' onchange='t.setmenge(this.form.gewicht.options[this.form.gewicht.selectedIndex].value)' "
				+ "style='width: 160px;'>\n<option value='250' "
				+ ((t.gewicht == 250) ? "selected='selected'" : "")
				+ ">250 g</option>\n" 
				+ "<option value='500' "
				+ ((t.gewicht == 500) ? "selected='selected'" : "")
				+ ">500 g</option>\n"
				+ "<option value='1000' "
				+ ((t.gewicht == 1000) ? "selected='selected'" : "")
				+ ">1000 g</option>\n"
				+ "<option value='2000' "
				+ ((t.gewicht == 2000) ? "selected='selected'" : "")
				+ ">2000 g</option>\n"
				+ "<option value='5000' "
				+ ((t.gewicht == 5000) ? "selected='selected'" : "")
				+ ">5000 g</option>\n"
				+ "</select></div>"
				+ '</td></tr>';""
	}else{
		ausgabe += "\n<table width='360' height='"+tableheight+"' style='table-layout:fixed; border:0px #633000 solid;"	
				+ "padding:0px;margin0px;border-collapse:collapse;min-width:320px;max-height:"+tableheight+"px;min-height:"+tableheight+"px;'>\n\n<!- INNER TABLE ->";
	}


	/* wenn nur eine der Sorten frei ist : true sonst false */
	this.currentID="";
	var alla = true;
	if (this.free_amount('t') > 1)
		alla = false;

	/** ****************MAIN LOOP****************** */
	/** ******************************************* */
	for (var y = 0; y < this.s_id.length; y++) {
		/* BGCOL - Hintergrundfarbe */
		if (y % 2 == 0) {
			bgcol = "url(includes/modules/ccb/icons/k"+this.s_taste[y]+"-a.jpg) no-repeat";
			// bgt="includes/modules/ccb/icons/k"+this.s_taste[y]+"-a.jpg";
			bgt="images/newbkr/BKR_kaffeebohnen2.jpg";
			//bgcol = "rgb(102, 68, 34)";
		} else {
			bgcol = "url(includes/modules/ccb/icons/k"+this.s_taste[y]+"-b.jpg) no-repeat";
			// bgt="includes/modules/ccb/icons/k"+this.s_taste[y]+"-b.jpg";
			bgt="images/newbkr/BKR_kaffeebohnen2.jpg";
			//bgcol = "rgb(88, 68, 30)";
		}

		c_content = '<tr><td height='+ this.gh(this.s_menge[y])+' style="vertical-align: top; margin:0;padding:0; background: url(\''+bgt+'\');">'
				+ '<div style="position: relative; padding: 7px 0 0 10px;"><b>' + this.s_name[y] + '</b><br /><small>' + this.s_gewicht[y] + ' g (' + number_format(((this.c_preis[y] * (this.gewicht / this.preis_base)) * 1.07), 2, ',', '') + ' EUR)</small>';
				
		c_content += '<input name="f_' + this.s_id[y]
				+ '" size="3" class="' + this.s_id[y] + '" type="text" maxlength="3" ';
		c_content += (this.s_fix[y] || alla) ? "value = '" + this.s_menge[y]
				+ "%' disabled='disabled'" : "value='" + this.s_menge[y] + "%'";
		c_content += ' style="width: ' + (this.s_id.length == 1 ? '40' : '30') + 'px; position: absolute; top: 30px; right: 95px; height: 23px;';
		c_content += (this.s_fix[y] || alla) ? 'background-color: #E6E6E6;"' : 'background-color: #FFFFFF;"';
		c_content += " onchange='set_value(" + this.s_id[y] + ")' />";
				
		c_content += (this.s_fix[y] || alla) ? '' : '<a	href="javascript:add_value('
				+ this.s_id[y] + ')">';
		c_content += '<img class="BKR btn_grau_zaehler_mehr" src="images/pixel_trans.gif" style="position: absolute; top: 30px; right: 81px;" />';
		c_content += (this.s_fix[y] || alla) ? '' : "</a>";
				
		c_content += (this.s_fix[y] || alla) ? '' : '<a href="javascript:sub_value('
				+ this.s_id[y] + ')">';
		c_content += '<img class="BKR btn_grau_zaehler_weniger" src="images/pixel_trans.gif" style="position: absolute; top: 42px; right: 81px;" />';
		c_content += (this.s_fix[y] || alla) ? '' : "</a>";
				
		if (this.s_fix[y]) {
			c_content += '<a href="javascript:t.unfix('
					+ this.s_id[y]
					+ ')"><img src="images/newbkr/lock.jpg" style="position: absolute; top: 30px; right: 45px;" title="Anteil der Kaffeesorte entsperren"></a>'
		} else {
			c_content += '<a href="javascript:t.fix('
					+ this.s_id[y]
					+ ')"><img class="BKR btn_grau_schloss" src="images/pixel_trans.gif" style="position: absolute; top: 30px; right: 45px;" title="Anteil der Kaffeesorte fixieren"></a>'
		}
		c_content += '<a href="javascript:t.del_item('
				+ this.s_id[y]
				+ ')"><img class="BKR btn_grau_-_klein" src="images/pixel_trans.gif" style="position: absolute; top: 30px; right: 10px;" title="Diese Kaffeesorte aus der Mischung entfernen">' +
						'</a>\n<!- ----CELL 4 END------ ->\n';

		//restheight = this.gh(this.s_menge[y]) - 110;
		//if (restheight > 1) {
		//	c_content += '<tr><td colspan="4" height="' + restheight
		//			+ '" style="width:360px;max-height:' + restheight
		//			+ '"></td></tr>\n';
		//}
		c_content += '\n\n<!- --------------ENTRY ' + y
				+ '  END------------------- ->\n'
				
		c_content	+= '</div></td></tr>';
				
				
		c_content += "<input type='hidden' name='item[]' value='"+ this.s_id[y] +"' />"
				+ "<input type='hidden' name='name[]' value='"+ this.s_name[y] +"' />"
				+ "<input type='hidden' name='preis[]' value='"+ this.s_preis[y] +"' />"
				+ "<input type='hidden' name='menge[]' value='"+ this.s_menge[y] +"' />"
				+ "<input type='hidden' name='taste[]' value='"+ this.s_taste[y] +"' />";
// ID,name,preis,menge,geschmack Hidden Fields!!

		ausgabe += c_content; // Inhalt

	}// LOOP
	// Tabelle Ende
	if (this.s_id.length > 0 ){
	ausgabe += '<tr><td height="115" style="padding: 0; margin: 0; border: 0px;">'
				+ '<div class="grid_3" style="padding: 13px 0 0 5px;">'
				+ "<select name='gewicht' size='1' style='width: 80px' onchange='t.setmenge(this.form.gewicht.options[this.form.gewicht.selectedIndex].value)' "
				+ "style='width: 160px;'>\n<option value='250' "
				+ ((t.gewicht == 250) ? "selected='selected'" : "")
				+ ">250 g</option>\n" 
				+ "<option value='500' "
				+ ((t.gewicht == 500) ? "selected='selected'" : "")
				+ ">500 g</option>\n"
				+ "<option value='1000' "
				+ ((t.gewicht == 1000) ? "selected='selected'" : "")
				+ ">1000 g</option>\n"
				+ "<option value='2000' "
				+ ((t.gewicht == 2000) ? "selected='selected'" : "")
				+ ">2000 g</option>\n"
				+ "<option value='5000' "
				+ ((t.gewicht == 5000) ? "selected='selected'" : "")
				+ ">5000 g</option>\n"
				+ "</select></div>"
				+ '<div class="grid_3 alpha" style="padding: 10px 0 0 0; background: url(\'images/newbkr/deltaorange.png\') no-repeat; background-position: 0px 15px; color: #FFFFFF; font-size: 24px; line-height: 30px; text-align: right;">'
				+ number_format(this.get_preis(), 2, ',', '') + " EUR"
				+ "</div>"
				+ '</td></tr>';
			}
			
	ausgabe += "</table> \n ";// Zelle zu

	var muehle_close = "</div><div class=\"grid_9 alpha omega\" style=\"height: 60px; background: url('images/newbkr/muehle-bottom.png') no-repeat; background-position: 4px 0px; padding: 20px 0 0 70px;\">";

	if (this.s_id.length > 1 ) {
		muehle_close += button;
	}
	
	muehle_close += "</div></div>"
					+ "<input type='hidden' name='ccb_weight' value='"+ this.get_gewicht() +"' />"
					+ "<input type='hidden' name='ccb_ID' value='"+ this.ccb_id +"' />"
					+ "<input type='hidden' name='ccb_preis' value='"+ this.get_preis() +"' />";


	ausgabe += muehle_close
			+ "</form>";
	return ausgabe;
}

ccb.prototype.get_preis = function() {
	var preis = 0;
	for (var d = 0; d < this.s_id.length; d++) {
		preis += parseFloat(this.c_preis[d]);
	}
	
	preis = Math.round(preis * 10000) / 10000;
	preis *= (this.gewicht / this.preis_base);
	var tax = Math.round(preis * tax_rate) / 100;
	return preis = preis + tax;
}
// //
ccb.prototype.get_gewicht = function() {
	var gewicht = 0;
	for (var i = 0; i < this.s_id.length; i++) {
		gewicht += this.s_gewicht[i];
	}
	return gewicht;
}
// //
//EOF CCB
// //
function set_name(){
	var nux = document.forms["sorts"].elements["ccb_name"].value;
	t.titel=nux;
	//aktualisiere_alles();

}
// //
function add_item(soID, soname, sopreis, sotaste) {
	// this.currentID = soID;
	if (t.add_sorte(soID, soname, sopreis, sotaste)) {
		aktualisiere_alles();
	}

}
// //
function set_value(IT) {
	var i = t.s_id.length;
     
    while (i--) {
		if (t.s_id[i] === IT) {
			var fname = "f_" + IT;
			var loli = parseInt(document.forms["sorts"].elements[fname].value);
			t.set_amount(IT, loli);
			aktualisiere_alles();
			return true;
		}
	}
}
// //
function add_value(IT) {
	t.add_amount(IT, 1);
	aktualisiere_alles();
}
// //
function sub_value(IT) {
	t.sub_amount(IT, 1);
	aktualisiere_alles();
}
// //
function /* out: String */number_format( /* in: float */number,
/* in: integer */laenge,
/* in: String */sep,
/* in: String */th_sep) {

	number = Math.round(number * Math.pow(10, laenge)) / Math.pow(10, laenge);
	str_number = number + "";
	arr_int = str_number.split(".");
	if (!arr_int[0])
		arr_int[0] = "0";
	if (!arr_int[1])
		arr_int[1] = "";
	if (arr_int[1].length < laenge) {
		nachkomma = arr_int[1];
		for (i = arr_int[1].length + 1; i <= laenge; i++) {
			nachkomma += "0";
		}
		arr_int[1] = nachkomma;
	}
	if (th_sep != "" && arr_int[0].length > 3) {
		Begriff = arr_int[0];
		arr_int[0] = "";
		for (j = 3; j < Begriff.length; j += 3) {
			Extrakt = Begriff.slice(Begriff.length - j, Begriff.length - j + 3);
			arr_int[0] = th_sep + Extrakt + arr_int[0] + "";
		}
		str_first = Begriff.substr(0, (Begriff.length % 3 == 0)
						? 3
						: (Begriff.length % 3));
		arr_int[0] = str_first + arr_int[0];
	}
	return arr_int[0] + sep + arr_int[1];
}
// //
function aktualisiere_alles() {
	$(document).ready(function() {
				$("div#sorten").html(t.make_html());
			});
}
me=0;
function openp(n) {
	if (me==n)me=0;
	if (me!=0){
	if (document.getElementById(me).style.display == "block")
		document.getElementById(me).style.display = "none";
	}
	me=n;
	if (document.getElementById(n).style.display == "block")
		document.getElementById(n).style.display = "none";
	else
		document.getElementById(n).style.display = "block";
}
//
function set_added(ID) {
	var tn = "mark" + ID;
	var aBtn = "addBtn" + ID;
	var dBtn = "delBtn" + ID;
	//document.getElementById(tn).style.background = "#ffeedd";
	document.getElementById(tn).className = "grid_8 alpha omega ccbCoffee inset";
	document.getElementById(aBtn).style.display = "none";
	document.getElementById(dBtn).style.display = "block";
}
//
function set_deleted(ID) {
	var tn = "mark" + ID;
	var aBtn = "addBtn" + ID;
	var dBtn = "delBtn" + ID;
	//document.getElementById(tn).style.background = "#ffbb99";
	document.getElementById(tn).className = "grid_8 alpha omega ccbCoffee";
	document.getElementById(dBtn).style.display = "none";
	document.getElementById(aBtn).style.display = "block";
}

function set_menge(val) {
	t.gewicht = parseInt(val);
	t.recalc();
	aktualisiere_alles();

}

function check_name() {
	if (t.titel == "" || t.titel == "Kaffeename?") {
		var input = document.forms["sorts"].elements["ccb_name"];
		input.style.border = "solid 4px #FFAAAA";
		input.style.top = "121px";
		input.style.left = "136px";
		document.getElementById("sorten").scrollIntoView(true);
		alert("Bitte geben Sie ihrer Kaffeemischung einen Namen.");
		return false;
	}
	return true;
}

function new_blend() {
	for (var i = 0; i < t.s_id.length; i++) {
		set_deleted(t.s_id[i]);
	}	
	t.titel = "Kaffeename?";
	t.gewicht = 1000;
	t.s_id.length = 0;
	t.s_menge.length = 0;
	t.s_gewicht.length = 0;
	t.s_name.length = 0;
	t.s_preis.length = 0;
	t.s_fix.length = 0;
	t.s_taste.length = 0;
	t.c_preis.length = 0;
	t.recalc();
	aktualisiere_alles();
}

// // // // // //Hauptprogramm
var b = new Array();
b[0] = new Image(); b[0].src = "includes/modules/ccb/icons/k1-a.jpg";
b[1] = new Image(); b[1].src = "includes/modules/ccb/icons/k1-b.jpg";
b[2] = new Image(); b[2].src = "includes/modules/ccb/icons/k2-a.jpg";
b[3] = new Image(); b[3].src = "includes/modules/ccb/icons/k2-b.jpg";
b[4] = new Image(); b[4].src = "includes/modules/ccb/icons/k3-a.jpg";
b[5] = new Image(); b[5].src = "includes/modules/ccb/icons/k3-b.jpg";
b[6] = new Image(); b[1].src = "includes/modules/ccb/icons/k4-a.jpg";
b[7] = new Image(); b[2].src = "includes/modules/ccb/icons/k4-b.jpg";
b[8] = new Image(); b[3].src = "includes/modules/ccb/icons/k5-a.jpg";
b[9] = new Image(); b[4].src = "includes/modules/ccb/icons/k5-b.jpg";
b[10] = new Image(); b[4].src = "includes/modules/ccb/icons/delete_16x16.gif";
b[11] = new Image(); b[4].src = "includes/modules/ccb/icons/unlock_16x16.gif";
b[12] = new Image(); b[4].src = "includes/modules/ccb/icons/lock_16x16.gif";

var sender;
sender = false;
function setsender() {
	sender = true;
}
function sendertest() {
	return sender;
}

var t=new ccb();

if(itemi.length > 0){
	t.init(itemi.shift(),itemi.shift(),itemi.shift(),itemi.shift() );
	}else{
		t.init();
		}

if(itemarr.length > 0){
	t.init_values(itemarr);
}

aktualisiere_alles();
