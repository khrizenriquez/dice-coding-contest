/*
	autor:			@khrizenriquez #afro-K
	descripci??n:	se listar??n los datos seg??n la informaci??n obtenida por la API de dice http://www.dice.com/common/content/documentation/api.html?CMPID=AF_PG_UP_JS_AV_CC__&utm_source=Programmr&utm_medium=Partner&utm_content=&utm_campaign=Advocacy_CodingChallenge
					donde se mostrar??n los empleos para desarrolladores m??viles o todos los empleos 
					para la competencia "Dice Coding Contest" de Programmr ( http://www.programmr.com/dice-jobs-coding-contest )

	otras referencias: Usar?? los mapas de Highcharts para desplegar la informaci??n, stylus para crear un mejor CSS, JS para darle vida a la App.
*/

( function ( ) {
	'use strict';
	//		Declarando las variables globales
	var url = "https://secure.dice.com/oauth/token?grant_type=client_credentials";
	var dataEncode = window.btoa( "diceHackathon:9fc52528-080d-4f0c-becd-45acf46bac4e" );
	var token, regiones, jobs;
	//		Desde que inicia la aplicaci??n v??a Ajax verifico los datos que me proporciona la API de "dice"
	document.addEventListener( "DOMContentLoaded", cargaInicial () );

	function cargaInicial () {
		//		mostrando mensajes de carga
		efectoCargar ();

		autenticandome ();
	}
	//		Opciones de la gr??fica de Highcharts
	function cargandoGraficaPie ( chartTitle, chartData, tooltipTitle ) {
		document.querySelector( ".infoValues legend" ).innerHTML = "Data";
		$('#chartJobsData').highcharts({
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: 0,
				plotShadow: false
			},
			title: {
				text: chartTitle,
				align: 'center',
				verticalAlign: 'middle',
				y: 50
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			plotOptions: {
				pie: {
					dataLabels: {
						enabled: true,
						distance: -50,
						style: {
							fontWeight: 'bold',
							color: 'white',
							textShadow: '0px 1px 2px black'
						}
					},
					startAngle: -90,
					endAngle: 90,
					center: ['50%', '75%']
				}
			},
			series: [{
				type: 'pie',
				name: tooltipTitle,
				innerSize: '50%',
				data: chartData
			}]
		});
	}

	document.getElementById( "jobsList" ).addEventListener( "change", function () {
		//		mostrando mensajes de carga
		efectoCargar ();
		if ( parseInt( this.value ) === 0 ) {
			quitarEfectoCargar ();
			limpiarValores();
		} else
		if ( parseInt( this.value ) === 6 ) {
			//		Jobs graph by region
			obteniendoDatos ( 2, "mobile, android, ios, windows phone, UI / UX developers" );
		} else {
			obteniendoDatos ( 1, this.value );
		}
	} );

	function autenticandome () {
		var xhr = new XMLHttpRequest();
		xhr.open( "POST", url, true );
		xhr.onreadystatechange = function () {
			if ( xhr.readyState === 4 ) {
				if ( xhr.status === 200 ) {
					var data = JSON.parse( xhr.responseText );
					token = data.access_token;
					document.getElementById( "jobsList" ).value = 6;
					obteniendoDatos ( 2, "mobile, android, ios, windows phone, UI / UX developers" );
				} else {
					//		Por si falla
					falloConexion ();
				}
			}
		};
		xhr.setRequestHeader( "Authorization", "Basic " + dataEncode );
		xhr.setRequestHeader( "Content-Type", "application/json" );
		xhr.send();
	}

	function obteniendoDatos ( tipoBusqueda, parametros ) {
		var datosGet = new XMLHttpRequest();
		datosGet.open( "GET", "https://api.dice.com/jobs?q=California, " + parametros, true );
		datosGet.onreadystatechange = function () {
			if ( datosGet.readyState === 4 ) {
				if ( datosGet.status === 200 ) {
					var data = JSON.parse( datosGet.responseText );
					if ( tipoBusqueda === 1 ) {
						document.getElementById( "chartJobsData" ).innerHTML = "";
						document.getElementById( "regionJobsData" ).innerHTML = "";
						//document.getElementById( "chartJobsData" ).innerHTML = "<span>"+
							//"<i class='el-icon-group'></i></span>";
						document.getElementById( "chartJobsData" ).innerHTML = "<span>:)</span>";
						jobs = [];
						/*
							guardo la descripci??n del empleo, nombre de la compa??ia, nombre del puesto, rango de pago, 
							region y ciudad, telecommute
						*/
						for (var i = 0; i < data.searchResults.length; i++ ) {
							//		mi primer filtro ser?? que sean empleos que tengan algo relacioando con m??viles
							var description = data.searchResults[ i ].description.toLowerCase();
							if ( description.indexOf( " ui " ) !== -1 || description.indexOf( " mobile " ) !== -1 ) {
								if ( data.searchResults[ i ].position.location.region === "CA" ) {
									var bandera = false;
									if ( data.searchResults[ i ].taxTerms !== undefined ) {
										for ( var tax = 0; tax < data.searchResults[ i ].taxTerms.length; tax++ ) {
											var taxTerms = data.searchResults[ i ].taxTerms[ tax ].toLowerCase();
											if ( taxTerms === "fulltime" )
												bandera = true;
										}
									}
									if ( bandera ) {
										jobs.push( [ i, "UI-Region-FullTime", data.searchResults[ i ].description, data.searchResults[ i ].company.name, data.searchResults[ i ].position.title, data.searchResults[ i ].payRate, data.searchResults[ i ].position.location.city, data.searchResults[ i ].position.location.region, data.searchResults[ i ].telecommuteOption ] );
									}
									continue;
								}
							}
						}
						var combo = document.getElementById( "jobsList" );
						var selected = combo.options[ combo.selectedIndex ].text;
						mostrandoDatos ( document.querySelector( ".searchValues .listValues .list-group" ), jobs, document.querySelector( ".searchValues .listValues h3" ), "Jobs: <small>"+ selected +"</small>", 1 );
						mostrandoChartJobsData();
					}
					if ( tipoBusqueda === 2 ) {
						regiones = [], jobs = [];
						var conteo = 0
						for (var i = 0; i < data.searchResults.length; i++ ) {
							if ( regiones.length === 0 ) {
								regiones.push( [ data.searchResults[ i ].position.location.region, 1 ] );
								jobs.push( [ i, data.searchResults[ i ].position.location.region, 1, [ data.searchResults[ i ].position.location.city ], [ data.searchResults[ i ].position.title ] ] );
							} else {
								var bandera = false;
								for ( var j = 0; j < regiones.length; j++ ) {
									if ( data.searchResults[ i ].position.location.region === regiones[j][0] ) {
										bandera = true;
										regiones[ j ][ 1 ] = parseInt(regiones[ j ][ 1 ] ) + 1;
										jobs[ j ][ 2 ] = parseInt(jobs[ j ][ 2 ] ) + 1;
										jobs[ j ][ 3 ][ conteo++ ] = data.searchResults[ conteo ].position.location.city;
										conteo--;
										jobs[ j ][ 4 ][ conteo++ ] = data.searchResults[ conteo ].position.title;
										if ( data.searchResults[ conteo ].position !== undefined ) {
										}
										break;
									}
								}
								if ( !bandera ) {
									regiones.push( [ data.searchResults[ i ].position.location.region, 1 ] );
									jobs.push( [ i, data.searchResults[ i ].position.location.region, 1, [ data.searchResults[ i ].position.location.city ], [ data.searchResults[ i ].position.title ] ] );
								}
							}
						}
						cargandoGraficaPie ( "Jobs by region", regiones, "Percentage of jobs" );
						mostrandoDatos ( document.querySelector( ".searchValues .listValues .list-group" ), jobs, document.querySelector( ".searchValues .listValues h3" ), "Jobs: <small>Jobs by region</small>", 2 );
					}
					var selector = document.querySelector( ".searchValues .listValues .list-group" );
					selector.removeEventListener( "click", infoJobs, false );
					selector.addEventListener( "click", infoJobs, false );
				} else {
					falloConexion ();
				}
			}
		};
		datosGet.setRequestHeader( "Authorization", "Bearer " + token );
		datosGet.setRequestHeader( "Content-Type", "application/json" );
		datosGet.send();
	}
	function mostrandoDatos ( idContenedor, arrData, legendTitulo, contenidoTitulo, kind ) {
		document.querySelector( ".infoValues legend" ).innerHTML = "Data";
		quitarEfectoCargar ();
		idContenedor.innerHTML = "";
		//		colocando el t??tulo
		legendTitulo.innerHTML = contenidoTitulo;

		if ( kind === 1 ) {
			for ( var i = 0; i < arrData.length; i++ ) {
				if ( arrData[ i ][ 1 ] == "UI-Region-FullTime" ) {
					idContenedor.innerHTML += "<li id='info-"+ arrData[ i ][ 0 ] +"' class='list-group-item mobileJobs'><span class='badge'>"+
					1
					+" job</span>Mobile jobs in California: " + arrData[ i ][ 4 ] + "<br />(California, "
						+ arrData[ i ][ 6 ] +"<br />job position: FullTime, payRange: "
						+ arrData[ i ][ 5 ] +")</li>";
				}
			}
		} else
		if ( kind === 2 ) {
			for ( var i = 0; i < arrData.length; i++ ) {
				if ( parseInt( arrData[ i ][ 2 ] ) === 1 ) {
					var plural = "job";
				} else {
					var plural = "jobs";
				}
				idContenedor.innerHTML += "<li title='"+
				arrData[ i ][ 3 ]
				+"' id='info-"+ arrData[ i ][ 0 ] +"' class='list-group-item regionJobs'><span class='badge'>"+
				arrData[ i ][ 2 ] + " " + plural
				+"</span>Region job: " + arrData[ i ][ 1 ] + "</li>";
			}
		}
	}
	var infoJobs = function ( e ) {
		var idElement = e.target.id.replace( "info-", "" );
		if ( e.target.classList[ 1 ] === "mobileJobs" ) {
			mostrandoChartJobsData();
			document.getElementById( "chartJobsData" ).innerHTML = "<span>"+
			"<img alt='loading' src='public/img/preloaders/search.gif' />"
			+"</span>";
			setTimeout( function () {
				for ( var i = 0; i < jobs.length; i++ ) {
					if ( jobs[ i ][ 0 ] === parseInt( idElement ) ) {
						//title
						document.querySelector( ".infoValues legend" ).innerHTML = jobs[ i ][ 4 ];
						//body data
						document.getElementById( "chartJobsData" ).innerHTML = jobs[ i ][ 2 ];
						break;
					} else {
						document.querySelector( ".infoValues legend" ).innerHTML = "Data";
						document.getElementById( "chartJobsData" ).innerHTML = "No data...";
					}
				}
			}, 500 );
		} else
		if ( e.target.classList[ 1 ] === "regionJobs" ) {
			var city, titleJob;
			setTimeout( function () {
				mostrandoRegionJobsData();
				document.getElementById( "chartJobsData" ).innerHTML = "<span>"+
				"<img alt='loading' src='public/img/preloaders/search.gif' />"
				+"</span>";
				for ( var i = 0; i < jobs.length; i++ ) {
					document.getElementById( "regionJobsData" ).innerHTML = "";
					//document.getElementById( "regionJobsData" ).innerHTML = "<div class='seeGraph'><i class='el-icon-circle-arrow-left'></i> Return to chart</div>";
					document.getElementById( "regionJobsData" ).innerHTML = "<div class='seeGraph'>< Return to chart</div>";
					if ( jobs[ i ][ 0 ] === parseInt( idElement ) ) {
						quitarEfectoCargar();
						if ( jobs[ i ][ 3 ].length === jobs[ i ][ 4 ].length ) {
							for ( var interno = 0; interno < jobs[ i ][ 3 ].length; interno++ ) {
								if ( jobs[ i ][ 3 ][ interno ] !== undefined ) {
									document.getElementById( "regionJobsData" ).innerHTML += "<label>City: "+
									jobs[ i ][ 3 ][ interno ] + " || Title job: " + jobs[ i ][ 4 ][ interno ]
									+"</label>";
								}
							}
						}
						document.querySelector( ".infoValues legend" ).innerHTML = "Region selected: " + jobs[ i ][ 1 ];
						var selector = document.querySelector( ".infoValues #regionJobsData .seeGraph" );
						selector.removeEventListener( "click", seeGraph, false );
						selector.addEventListener( "click", seeGraph, false );
						break;
					} else {
						document.querySelector( ".infoValues legend" ).innerHTML = "Data";
						document.getElementById( "regionJobsData" ).innerHTML = "No data...";
					}
				}
			}, 500 );
		}
	}
	var seeGraph = function ( e ) {
		document.getElementById( "chartJobsData" ).innerHTML = "<span>"+
		"<img alt='loading' src='public/img/preloaders/search.gif' />"
		+"</span>";
		mostrandoChartJobsData();
		cargandoGraficaPie ( "Jobs by region", regiones, "Percentage of jobs" );
	}
	/*		--------------------Procediminetos--------------------		*/
	function efectoCargar ( ) {
		for ( var i = 0; i < document.querySelectorAll( ".message" ).length; i++ ) {
			document.querySelectorAll( ".message" )[ i ].innerHTML = "<span>"+
			"<img alt='loading' src='public/img/preloaders/search.gif' />"
			+"</span>";
		}
	}
	function quitarEfectoCargar ( ) {
		document.querySelector( ".infoValues legend" ).innerHTML = "Data";
		for ( var i = 0; i < document.querySelectorAll( ".message" ).length; i++ ) {
			document.querySelectorAll( ".message" )[ i ].innerHTML = "";
		}
	}
	function falloConexion ( ) {
		quitarEfectoCargar ();
		document.querySelector( ".infoValues legend" ).innerHTML = "Data";
		document.getElementById( "regionJobsData" ).innerHTML = "";
		document.getElementById( "chartJobsData" ).innerHTML = "";
		document.querySelector( ".searchValues .listValues .list-group" ).innerHTML = "";
		document.querySelector( ".searchValues .listValues h3" ).innerHTML = "";
		//document.getElementById( "chartJobsData" ).innerHTML = "<span>"+
		//"<i class='el-icon-group'></i></span>";
		document.getElementById( "chartJobsData" ).innerHTML = "<span>:)</span>";
		document.querySelector( ".message" ).innerHTML = "Sorry, but we could not connect try again.";
	}
	function limpiarValores ( ) {
		document.getElementById( "chartJobsData" ).innerHTML = "";
		document.getElementById( "regionJobsData" ).innerHTML = "";
		document.querySelector( ".searchValues .listValues .list-group" ).innerHTML = "";
		document.querySelector( ".searchValues .listValues h3" ).innerHTML = "";
		//document.getElementById( "chartJobsData" ).innerHTML = "<span>"+
		//"<i class='el-icon-group'></i></span>";
		document.getElementById( "chartJobsData" ).innerHTML = "<span>:)</span>";
	}
	function mostrandoChartJobsData ( ) {
		document.getElementById( "regionJobsData" ).style.width = "0%";
		document.getElementById( "regionJobsData" ).style.height = "0%";
		document.getElementById( "regionJobsData" ).style.display = "none";
		document.getElementById( "chartJobsData" ).style.width = "100%";
		document.getElementById( "chartJobsData" ).style.height = "100%";
		document.getElementById( "chartJobsData" ).style.display = "block";
	}
	function mostrandoRegionJobsData () {
		document.getElementById( "chartJobsData" ).style.width = "0%";
		document.getElementById( "chartJobsData" ).style.height = "0%";
		document.getElementById( "chartJobsData" ).style.display = "none";
		document.getElementById( "regionJobsData" ).style.width = "100%";
		document.getElementById( "regionJobsData" ).style.height = "100%";
		document.getElementById( "regionJobsData" ).style.display = "block";
	}
	/*		--------------------Fin procediminetos--------------------		*/
} )();
$(function () {
	var nua = navigator.userAgent;
	var isAndroid = (nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1 && nua.indexOf('Chrome') === -1);
	if (isAndroid) {
		$('select.form-control').removeClass('form-control').css('width', '100%');
	}
});
