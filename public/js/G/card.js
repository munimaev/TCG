/**
 * Создает объект Card.
 * @class
 * @param {type} o
 * o.id - индификатор карты, станет именем переименной в которой будет содержаться объект.
 * @returns {Card} Объект Card.
 */
function Card( o ) {
    this.id = o.id;
    /**
     * Возвращает параметр name для карты из массива upd,
     * если такойго параметра не было (напрмер при создании карты), 
     * то данные будут барться из объекта o (переданного в конструктор класса).
     * Если и там его не окжется, то функция попытаеться взять значение, у текущего экземпляра объекта Card.
     * Если все же икомое значение не найдено возвращаеться занчение пременной alternative.
     * @param {[type]} name        имя параметра
     * @param {[type]} alternative альтернативаное значение
     * @param {[type]} upd         объект из которого будут браться значнеия
     */
    this.setParam = function( name, alternative, upd ) {
        var o = upd || o || {};
        if ('faceUp' in o && !o.faceUp == true
            && name != 'zindex') {
            return null;
        }
        if ( name in o ) return o[name];
        if ( (C[this.id]) && (name in C[this.id]) ) return C[this.id][name];
        if ( (C[this.id]) && (name in C[this.id].params) ) return C[this.id].params[name];
        if ( alternative ) return alternative;
        return null;
    }
    /**
     * Устанавливает параметры для объекта для большинства используеться this.setParam.
     * @param {[type]} upd Необязательныей аргумент, в содержаться пармаетры которые необходимо одновить.
     */
    this.setAllParams = function(upd){
        var upd = upd || null;
        this.params = {
            action: false,
            ah: this.setParam( 'ah', 2 + Math.round( Math.random() * 8 ), upd ),
            ai: this.setParam( 'ai', 2 + Math.round( Math.random() * 8 ), upd ),
            borderSize: 1,
            colorCorner: '#FFF',
            colorSide: '#FFF',
            deepCorner: 10,
            deepoutShell: 2,
            deepPower: 1,
            deepSide: 10,
            elements: this.setParam( 'elements',  'F',upd),
            faceUp: ('faceUp' in o) ? o.faceUp : false,
            H: I.card.W,
            hover: false,
            img: this.setParam( 'img', 2 ,upd),
            incline: { x: 0, y: 0, z: 0, deg: 0 },
            isDisplayeTeamPower: ('isDisplayeTeamPower' in o) ? o.isDisplayeTeamPower : false,
            isHealt: ('isHealt' in o) ? o.isHealt : true,
            owner: ('owner' in o) ? o.owner : 'you',
            position: { X: ('X' in o) ? o.X : 0, Y: ('Y' in o) ? o.Y : 0 },
            prewiev: false,
            select: false,
            sh: this.setParam( 'sh', Math.round( Math.random() * 8 ) ,upd ),
            si: this.setParam( 'si', Math.round( Math.random() * 8 ) , upd),
            status: 'card',
            team: ('team' in o) ? o.team : null,
            teamPosition: ('position' in o) ? o.position : null,
            type: ('type' in o) ? o.type : 'N',
            W: I.card.W,
            zindex: this.setParam( 'zindex', 0, upd),
            zona: ('zona' in o) ? o.zona : 'deck',
            name: ('name' in o) ? o.name : 'Имя',
            hc : ('hc' in o) ? o.hc : 0,
            ec : ('ec' in o) ? o.ec : 0,
        };
        if (S.statuses[this.id]) {
            var statuses = S.statuses[this.id];
            if (statuses.injured) this.params.isHealt = false; 
        }
    };

    this.setNewParams = function(upd){
        for (var i in upd)  {
            this.params[i] = upd[i];
        }
    };

    this.setAllParams(o);

    this.glossary = {
        colors: {
            card: {
                bg: { 'N': { r: 176, g: 196, b: 222, a: 0 } }
            }
        }
    };
    //console.log(this.params.H)
    if ( ('H' in o) && ('W' in o) ) {
        this.params.H = o.H;
        this.params.W = o.W;
    }
    else if ( 'H' in o ) {
        this.params.H = o.H;
        this.params.W = o.H;
    }
    else if ( 'W' in o ) {
        this.params.H = o.W;
        this.params.W = o.W;
    }
    else {
        var rand = 50 + Math.random() * 150;
        this.params.H = rand;
        this.params.W = rand;
    }
    ;
    //console.log(o.H)


    /**
     * Обновляет визуальное представление силы ниндзя.
     * @param {Number} size Размер карты под который нужно "подогнать" размер символов.
     * @param {object} o Служебный объект.
     * o.this - Объект Card.
     */
    this.instPower = function( size, o ) {
        o._this.$power.css( 'fontSize', size / 4 + 'px' ).
            css( 'lineHeight', size / 4 + 'px' );
    };
    /**
     * Обновляет визуальное представление силы команды.
     * @param {Number} size Размер карты под который нужно "подогнать" размер символов.
     * @param {object} o Служебный объект.
     * o.this - Объект Card.
     */
    this.instTeamPower = function( size, o ) {
        LogI['instTeamPower'] = 0;
        Log( 1, 'instTeamPower' );
        Log( 0, 'size', size );
        var prefix = 'opp';
        if ( you == o._this.params.owner ) {
            prefix = 'you';
        }
        $( '.' + prefix + 'TeamPower', o._this.$id ).css( 'fontSize', size / 4 + 'px' ).
            css( 'lineHeight', size / 4 + 'px' );
        Log( -1, 'instTeamPower' );
    };
    this.instMouseControleDown = function( size, o ) {
        if (o._this.params.status == 'card') {
            o._this.$mouse.css( '-webkit-transform', 'translate3d(0,0,' + (size / 15 + 1) + 'px )' )
            o._this.$mouse.css( '-moz-transform', 'translate3d(0,0,' + (size / 15 + 1) + 'px )' )
            o._this.$mouse.addClass( 'full' )
        } else {
            o._this.$mouse.css( '-webkit-transform', 'translate3d(0,0,' + (size / 15 + 1) + 'px )  rotate3d(0,0,1,45deg)' )
            o._this.$mouse.css( '-moz-transform', 'translate3d(0,0,' + (size / 15 + 1) + 'px )  rotate3d(0,0,1,45deg)' )
            o._this.$mouse.removeClass('full')
        }
    };
    this.instMouseControleUp = function( size, o ) {
        o._this.$mouse.css( '-webkit-transform', 'translate3d(0,0,' + (o._this.params.zindex) + 'px )' );
        o._this.$mouse.css( '-moz-transform', 'translate3d(0,0,' + (o._this.params.zindex) + 'px )' );
    };
    this.fillAsFaceUp = function( link ) {
        var mouseControle = this.params.status == 'card' ? 'mouseControle full' : 'mouseControle';
        var currentAttack = this.params.isHealt ? this.params.ah : this.params.ai;
        var currentSupport = this.params.isHealt ? this.params.sh : this.params.si;
        console.log(this.id, this.params.isHealt, currentAttack, currentSupport )
        link
            .append( $( '<div />', { 'class': 'cbg' } ) )
            .append( $( '<div />', { 'class': 'outShell' } )
                .css( 'width', '92%' )
                .css( 'height', '92%' )
                .css( 'top', '4%' )
                .css( 'left', '4%' )
                .append(
                    $( '<div />', {
                        'class': 'romb'
                    } ) // end create 'romb'
                    .append( $( '<div />', { 'class': 'corner ceb top '} )
                        .css('background', this.getBG('corner top')) )
                    .append( $( '<div />', { 'class': 'side ceb top left '} )
                        .css('background', this.getBG('side top left')) )
                    .append( $( '<div />', { 'class': 'side ceb top right '} )
                        .css('background', this.getBG('side top right')) )
                    .append( $( '<div />', { 'class': 'corner ceb left '} )
                        .css('background', this.getBG('corner left')) )
                    .append(
                        $( '<div />', { 'class': 'center ceb' } )
                        .append(
                            $( '<div />', { 'class': 'image' } )
                            .css( 'background-image', 'url(public/pics/' + this.params.img + '.jpg)' )
                            )
                        )// end append 'center'
                    .append( $( '<div />', { 'class': 'corner ceb right '} )
                        .css('background', this.getBG('corner right')) )
                    .append( $( '<div />', { 'class': 'side ceb bottom left '} ) 
                        .css('background', this.getBG('side bottom left')))
                    .append( $( '<div />', { 'class': 'side ceb bottom right '} )
                        .css('background', this.getBG('side bottom right')) )
                    .append( $( '<div />', { 'class': 'corner ceb bottom '} )
                        .css('background', this.getBG('corner bottom')) )
                    ) // end append 'romb'
                .append(
                    $( '<div />', {
                        'class': 'powerCurrent power ' + (this.params.isHealt  ? '' :'powerInjured'),
                        'text': currentAttack + '/' + currentSupport
                    } ) // end create 'power'
                    .css( 'fontSize', this.params.W / 4 + 'px' )
                    .css( 'lineHeight', this.params.W / 4 + 'px' )
                    )
                .append(
                    $( '<div />', {
                        'class': 'injuredPower power',
                        'text': this.params.ai + '/' + this.params.si
                    } ) // end create 'power'
                    .css( 'fontSize', this.params.W / 4 + 'px' )
                    .css( 'lineHeight', this.params.W / 4 + 'px' )
                    )
                .append(
                    $( '<div />', { 'class': 'icon cardIcon' } )
                    .css( 'left', '11%' )
                    .css( 'top', '0%' )
                    .css( 'width', '20%' )
                    .css( 'height', '20%' )
                    .append(
                        $( '<div />', { 'class': 'blur' } )
                        )
                    .append(
                        $( '<div />', { 'class': 'fire' } )
                        )
                    )
                .append(
                    $( '<div />', { 'class': 'icon cardIcon' } )
                    .css( 'left', '0%' )
                    .css( 'top', '11%' )
                    .css( 'width', '20%' )
                    .css( 'height', '20%' )
                    .append(
                        $( '<div />', { 'class': 'blur' } )
                        )
                    .append(
                        $( '<div />', { 'class': 'void' } )
                        )
                    )
                .append(
                    $( '<div />', { 'class': 'icon cardIcon' } )
                    .css( 'right', '8%' )
                    .css( 'top', '-3%' )
                    .css( 'width', '25%' )
                    .css( 'height', '25%' )
                    .append(
                        $( '<div />', { 'class': 'handcost' + this.params.hc } )
                        )
                    )
                .append(
                    $( '<div />', { 'class': 'icon cardIcon' } )
                    .css( 'right', '-3%' )
                    .css( 'top', '9%' )
                    .css( 'width', '25%' )
                    .css( 'height', '25%' )
                    .append(
                        $( '<div />', { 'class': 'turncost' + this.params.ec } )
                        )
                    )
                .append(
                    $( '<div />', { 'class': 'icon atribut' } )
                    )
                )
            .append( $( '<div />', { 'class': 'mouseControle' } ) );
    };

    this.getBG = function(str) {
        switch (str) {
            case 'corner top':
                if (this.params.elements.length == 1) {
                    return '#'+D.colors[this.params.elements].dark;
                } else {
                    return '#'+D.colors[this.params.elements[1]].dark;
                }
            break;
            case 'side top left':
                if (this.params.elements.length == 1) {
                    return '#'+D.colors[this.params.elements].light;
                } else {
                    return '#'+D.colors[this.params.elements[0]].light
                    //return '-webkit-gradient(linear, left top, left bottom, color-stop(0%,#'+D.colors[this.params.elements[0]].light+'), color-stop(100%,#'+D.colors[this.params.elements[1]].light+'))';
                }
            break;
            case 'side top right':
                if (this.params.elements.length == 1) {
                    return '#'+D.colors[this.params.elements].light;
                } else {
                    return '-webkit-linear-gradient(left, #'+D.colors[this.params.elements[0]].light+' 0%,#'+D.colors[this.params.elements[1]].light+' 100%)'
                         //TODO //+ ';background:-moz-linear-gradient(left, #'+D.colors[this.params.elements[0]].light+' 0%,#'+D.colors[this.params.elements[1]].light+' 100%)';
                }
            break;
            case 'corner left':
                if (this.params.elements.length == 1) {
                    return '#'+D.colors[this.params.elements].dark;
                } else {
                    return '#'+D.colors[this.params.elements[0]].dark;
                }
            break;
            case 'corner right':
                if (this.params.elements.length == 1) {
                    return '#'+D.colors[this.params.elements].dark;
                } else {
                    return '#'+D.colors[this.params.elements[0]].dark;
                }
            break;
            case 'side bottom left':
                if (this.params.elements.length == 1) {
                    return '#'+D.colors[this.params.elements].light;
                } else {
                    return '#'+D.colors[this.params.elements[1]].light;
                    //return '-webkit-gradient(linear, left top, left bottom, color-stop(0%,#'+D.colors[this.params.elements[1]].light+'), color-stop(100%,#'+D.colors[this.params.elements[0]].light+'))';
                }
            break;
            case 'side bottom right':
                if (this.params.elements.length == 1) {
                    return '#'+D.colors[this.params.elements].light;
                } else {
                    return '-webkit-linear-gradient(left, #'+D.colors[this.params.elements[0]].light+' 0%,#'+D.colors[this.params.elements[1]].light+' 100%)'
                       //TODO  //  + 'background:-moz-linear-gradient(left, #'+D.colors[this.params.elements[0]].light+' 0%,#'+D.colors[this.params.elements[1]].light+' 100%);';
                }
            break;
            case 'corner bottom':
                if (this.params.elements.length == 1) {
                    return '#'+D.colors[this.params.elements].dark;
                } else {
                    return '#'+D.colors[this.params.elements[1]].dark;
                }
            break;

        }
    }
    
    this.fillAsFaceDown = function( link ) {
        link
            .append( $( '<div />', { 'class': 'cbg cbgD' } ) )
            .append( $( '<div />', { 'class': 'mouseControle' } ) );
    };

    this.updateLinks = function() {
        this.$id = $( '#' + this.id );
        this.$power = $( '.power', this.$id );
        this.$outShell = $( '.outShell', this.$id );
        this.$romb = $( '.romb', this.$id );
        this.$icons = $( '.cardIcon', this.$id );
        this.$mouse = $( '.mouseControle', this.$id );
        this.$cbg = $( '.cbg', this.$id );
    };

    this.create = function( id ) {
        var cbg = this.glossary.colors.card.bg[this.params.type];
        cbg.a = this.params.status === 'card' ? 1 : 0;
        cbg.a = 0;
        var $card = $( '<div /> ', {
            'class': 'card',
            'id': id
        } ) // end create 'card'
            .css( 'top', this.params.position.Y )
            .css( 'left', this.params.position.X )
            .css( 'width', this.params.W )
            .css( 'height', this.params.W )
            .css( 'backgroundColor', 'rgba(' + cbg.r + ',' + cbg.g + ',' + cbg.b + ',' + cbg.a + ')' );
        if ( this.params.faceUp ) {
            this.fillAsFaceUp( $card );
        } else {
            this.fillAsFaceDown( $card );
        }
        $( '#main' ).append( $card );
    };

    this.create( this.id );

    this.updateLinks();
    this.instMouseControleUp( null, {_this:this} );

    this.updateMouse = function() {
        var ido = o.id;
        this.$mouse.mouseenter(
            (function() {
                var id = ido;
                return function() {
                    if ( C[id].params.zona === 'hand' ) {
                        window.clearTimeout( G.timers.youHandHover );
                        AN.moveToPreview( { pX: C[id].params.owner } );
                    }
                    // Hover
                    if (C[id].params.hover != true) C[id].hover( true );

                    // Card Prewiev
                    window.clearTimeout( G.timers.cardPrewiev );
                    G.timers.cardPrewiev = setTimeout(
                        function() {
                            C[id].showPrewiev();
                        }, C[id].getCardPrewievTimer()
                    );
                };
            })()
            );
        this.$mouse.mouseout(
            (function() {
                var id = ido;
                return function() {
                    if ( C[id].params.zona === 'hand' ) {
                        G.timers.youHandHover = setTimeout(
                            function() {
                                AN.moveToHand( { pX: C[id].params.owner } );
                            }, 100
                            ); // end setTimeout

                    }

                    // Hover
                    if (C[id].params.hover != false) C[id].hover( false );

                    // Card Prewiev
                    window.clearTimeout( G.timers.cardPrewiev );
                    C[id].hidePrewiev();

                };
            })()
            );

        this.$mouse.click(
            (function() {
                var id = ido;
                return function() {
                    C[id].click()
                };
            })()
            );
    };

    this.getCardPrewievTimer = function() {
        var result = 800;
        if ( this.params.zona === 'hand' ) {
            result = 10;
        }
        return result;
    };

    this.updateMouse();

    this.flags = {
        is3D: 1
    };

    this.changeColor = function( color ) {
        var colorCorner, colorSide;
        switch ( color ) {
            case 'L':
                colorCorner = '#d458d7', colorSide = '#af25b0';
                break;
            case 'F':
                colorCorner = '#b3292a', colorSide = '#d65757';
                break;
            case 'W':
                colorCorner = '#277cb0', colorSide = '#51b0d1';
                break;
            case 'A':
                colorCorner = '#2ab2b8', colorSide = '#55cbd7';
                break;
            case 'E':
                colorCorner = '#d1d555', colorSide = '#b2b428';
                break;
            case 'V':
                colorCorner = '#7e7e7e', colorSide = '#9a9a9a';
                break;
        }
        this.params.colorCorner = colorCorner;
        this.params.colorSide = colorSide;
        $( '.corner', '#' + this.id ).css( 'backgroundColor', colorCorner );
        $( '.c3D', '#' + this.id ).css( 'backgroundColor', colorCorner );
        $( '.side', '#' + this.id ).css( 'backgroundColor', colorSide );
        $( '.s3D', '#' + this.id ).css( 'backgroundColor', colorSide );
    };

    this.onOff3D = function( str ) {
        var str = str;
        var id = this.id;
        if ( this.flags.is3D && str !== 'on' ) {
            $( '.c3D', '#' + id ).remove();
            $( '.s3D', '#' + id ).remove();
            this.flags.is3D = 0;
        }
        if ( !this.flags.is3D && str !== 'off' ) {
            var styleCornerColor = 'background-color:' + this.params.colorCorner + ';';
            var styleSideColor = 'background-color:' + this.params.colorSide + ';';
            for ( var i = 1; i <= 4; i++ ) {
                $( '.romb', '#' + id ).
                    append( $( '<div />', { 'class': 'c3D ceb c' + i,
                        'style': 'left:0%;top:0%;background:' + this.getBG('corner left') } ) );
                $( '.romb', '#' + id ).
                    append( $( '<div />', { 'class': 'c3D ceb c' + i,
                        'style': 'left:0%;top:95%;background:' + this.getBG('corner right') } ) );
                $( '.romb', '#' + id ).
                    append( $( '<div />', { 'class': 'c3D ceb c' + i,
                        'style': 'left:95%;top:0%;background:' + this.getBG('corner top') } ) );
                $( '.romb', '#' + id ).
                    append( $( '<div />', { 'class': 'c3D ceb c' + i,
                        'style': 'left:95%;top:95%;background:' + this.getBG('corner bottom') } ) );
            }

            $( '.romb', '#' + id ).
                append( $( '<div />', { 'class': 's3D ceb s1',
                    'style': 'left:0%;top:5%;background:' + this.getBG('side top left')  } ) );
            $( '.romb', '#' + id ).
                append( $( '<div />', { 'class': 's3D ceb s1',
                    'style': 'left:5%;top:5%;background:' + this.getBG('side top left') } ) );
            $( '.romb', '#' + id ).
                append( $( '<div />', { 'class': 's3D ceb s1',
                    'style': 'left:95%;top:5%;background:' + this.getBG('side bottom left') } ) );
            $( '.romb', '#' + id ).
                append( $( '<div />', { 'class': 's3D ceb s1',
                    'style': 'left:100%;top:5%;background:' + this.getBG('side bottom left') } ) );


            $( '.romb', '#' + id ).
                append( $( '<div />', { 'class': 's3D ceb s2',
                    'style': 'left:5%;top:0%;background:' + this.getBG('side top right') } ) );
            $( '.romb', '#' + id ).
                append( $( '<div />', { 'class': 's3D ceb s2',
                    'style': 'left:5%;top:5%;background:' + this.getBG('side top right') } ) );
            $( '.romb', '#' + id ).
                append( $( '<div />', { 'class': 's3D ceb s2',
                    'style': 'left:5%;top:95%;background:' + this.getBG('side top right') } ) );
            $( '.romb', '#' + id ).
                append( $( '<div />', { 'class': 's3D ceb s2',
                    'style': 'left:5%;top:100%;background:' + this.getBG('side top right') } ) );

            this.flags.is3D = 1;
        }
        this.upSideAndCorner( undefined, { '_this': this } );
    };

    this.upSideAndCorner = function( newSize, o ) {
        if ( o._this.flags.is3D ) {
            var currentSize = newSize || $( '#' + o._this.id ).width();
            o._this.params.deepCorner = currentSize / 30;
            o._this.params.deepSide = currentSize / 60;
            o._this.params.deepPower = currentSize / 15;
        } else {
            o._this.params.deepCorner = 0;
            o._this.params.deepSide = 0;
            o._this.params.deepPower = 1;
            o._this.params.deepoutShell = 2;
        }

        $( '.corner', '#' + o._this.id ).
            css( '-webkit-transform', 'translate3d(0,0,' + o._this.params.deepCorner + 'px)' ).
            css( '-moz-transform', 'translate3d(0,0,' + o._this.params.deepCorner + 'px)' );
        $( '.side', '#' + o._this.id ).
            css( '-webkit-transform', 'translate3d(0,0,' + o._this.params.deepSide + 'px)' ).
            css( '-moz-transform', 'translate3d(0,0,' + o._this.params.deepSide + 'px)' );
        $( '.power', '#' + o._this.id ).
            css( '-webkit-transform', 'translate3d(0,0,' + o._this.params.deepPower + 'px)' ).
            css( '-moz-transform', 'translate3d(0,0,' + o._this.params.deepPower + 'px)' );
        $( '.icon', '#' + o._this.id ).
            css( '-webkit-transform', 'translate3d(0,0,' + (o._this.params.deepPower - 0.1) + 'px )' ).
            css( '-moz-transform', 'translate3d(0,0,' + (o._this.params.deepPower - 0.1) + 'px )' );

        this.instMouseControleUp(newSize, o)
    };

    this.animation = function( o ) {
        // o.X = отступ слева
        // o.Y = отступ сверху
        // o.x = наклон по горизонтальной оси
        // o.y = наклон по вертикальной оси
        // o.z = поворот по перпендикулярной оси
        // o.deg = градусы
        // o.W = ширина (она же высота)
        // o.duration
        // o.aditional = {intoCard:true}
        o._this = this;
        o.duration = o.duration || 750;
        o.easing = o.easing || 'swing';

        var mainAnimation;

        var animateProperties = { };
        var animateOptions = { };

        o.isInclining = false;
        if ( ('x' in o && o.x !== this.params.incline.x)
            || ('y' in o && o.y !== this.params.incline.y)
            || ('z' in o && o.z !== this.params.incline.z)
            || ('deg' in o && o.deg !== this.params.incline.deg) ) {

            o.isInclining = true;
            mainAnimation = 'inclining';
            animateProperties = { 'textIdent': 0 };
        }
        ;

        o.isAdditional = false;
        if ( o.additional ) {
            o.isAdditional = true;
            mainAnimation = 'additional';
            animateProperties = { 'textIdent': 0 };
            if ( o.additional.intoCard ) {
                $( '.outShell', o._this.$id )
                    .css( 'width', '92%' )
                    .css( 'height', '92%' )
                    .css( 'top', '4%' )
                    .css( 'left', '4%' );
                o._this.$romb.removeClass( 'shadow' );
            }
            if ( o.additional.outCard && o._this.params.status == 'card') {
                $( '.outShell', o._this.$id )
                    .css( 'width', '100%' )
                    .css( 'height', '100%' )
                    .css( 'top', '0%' )
                    .css( 'left', '0%' );
                o._this.$romb.addClass( 'shadow' );
                o._this.params.status == o._this.params.type;
            }
        } else {
            o.additional = { };
        }
        ;

        o.isResizing = false;
        if ( 'W' in o && o.W !== this.params.W
            || 'H' in o && o.H !== this.params.H ) {
            o.isResizing = true;
            mainAnimation = 'resizing';
            animateProperties = { 'textIdent': 0 };

            if ( ('H' in o) && !('W' in o) )
                o.W = o.H;
            if ( ('W' in o) && !('H' in o) )
                o.H = o.W;

        }
        ;

        o.isMoving = false;
        if ( ('X' in o && o.X !== this.params.position.X)
            || ('Y' in o && o.Y !== this.params.position.Y) ) {

            o.isMoving = true;
            mainAnimation = 'moving';
            animateProperties = { };

            if ( 'Y' in o ) {
                animateProperties.top = o.Y;
            }
            //else { animateProperties.top = o.Y = this.params.position.Y ;}

            if ( 'X' in o ) {
                animateProperties.left = o.X;
            }
            //else { animateProperties.left = o.X = this.params.position.X ;}

            var moveIncline = this.moveIncline( o );
            o.xm = moveIncline.xm;
            o.ym = moveIncline.ym;
            o.degm = moveIncline.degm;
            o.trace = moveIncline.trace;
            //console.log(moveIncline);


            if ( o.additional && o.additional.curveMoving ) {
                animateProperties = { 'textIdent': 0 };
                o.trace = null;
            }
            else {
                this.params.position.X = o.X;
                this.params.position.Y = o.Y;
            }

        }
        ;

        var animationStep = this.animationStep;

        var done = function() {
        };

        // console.log(!o.isInclining, o.isMoving, !o.additional.incline);

        if ( (!o.isInclining && o.isMoving && !o.additional.incline) || o.additional.after ) {
            done = function() {
                //if (o._this.id == 'c005')console.log('after',o);
                //console.log(o._this.params);
                if ( !o.isInclining && o.isMoving && !o.additional.incline ) {
                //console.log(o._this.id, 'after')
                    o._this.animation( { x: 0, y: 0, z: 0, deg: 0,
                        duration: Math.round( o.duration / 2 ) } );
                }
                //console.log(o);
                if ( o.additional.after ) {
                    if ( o.additional.after.func ) {
                        o.additional.after.func();
                    }
                }
            };
        }


        this.$id.animate( animateProperties, {
            step: animationStep( o ),
            duration: o.duration,
            done: done
        }, o.easing );


    };

    this.animationStep = function( o ) {
        //console.log('animationStep');
        var oldXi, oldYi, oldZi, oldDegi;
        var oldX = oldXi = o._this.params.incline.x;
        var oldY = oldYi = o._this.params.incline.y;
        var oldZ = oldZi = o._this.params.incline.z;
        var oldDeg = oldDegi = o._this.params.incline.deg;
        var oldW = o._this.params.W;
        var oldH = o._this.params.H;

        //не стандартное перемещение
        var oldXm = o._this.params.position.X;
        var oldYm = o._this.params.position.Y;
        var newXm = o._this.params.position.X = 'X' in o ? o.X : oldXm;
        var newYm = o._this.params.position.Y = 'Y' in o ? o.Y : oldYm;


        // наклон для плоского передвижения с фиксированным наклоном в конечной точке
        var newXi = o._this.params.incline.x = 'x' in o ? o.x : 0;
        var newYi = o._this.params.incline.y = 'y' in o ? o.y : 0;
        var newZi = o._this.params.incline.z = 'z' in o ? o.z : 0;
        var newDegi = o._this.params.incline.deg = 'deg' in o ? o.deg : 0;
        // наклоны для плоского передвижения
        if ( !o.isInclining && o.isMoving && !o.additional.incline ) {
            var newX = o._this.params.incline.x = 'xm' in o ? o.xm : 0;
            var newY = o._this.params.incline.y = 'ym' in o ? o.ym : 0;
            var newZ = o._this.params.incline.z = 'zm' in o ? o.zm : 0;
            var newDeg = o._this.params.incline.deg = 'degm' in o ? o.degm : 0;
        }

        var newW = o._this.params.W = 'W' in o ? o.W : oldW;
        var newH = o._this.params.H = 'H' in o ? o.H : oldH;

        var newNow = 0;
        var duration = 'duration' in o ? o.duration : 500;
        var trace = 'trace' in o ? o.trace : null;

        if ( 'intoCard' in o.additional && o.additional.intoCard ) {
            if ( o._this.params.status === 'card' ) {
                o.additional.intoCard = false;
            }
            else {
                o._this.params.status = 'card';
                o._this.onOff3D( 'off' );
                $( '.powerCurrent', o._this.$id ).css( 'text-align', 'left' );
            }
        }

        if ( 'outCard' in o.additional && o.additional.outCard ) {
            if ( o._this.params.status !== 'card' ) {
                o.additional.outCard = false;
            }
            else {
                o._this.params.status = o._this.params.type;
                o._this.onOff3D( 'on' );
                $( '.powerCurrent', o._this.$id ).
                    css( 'text-align', 'center' );
            }
        }

        //console.log(o)

        return function( now, fx ) {
            //if (o._this.id == 'c005')console.log(o);

            if ( trace == null && newNow == 0 ) {
                newNow = 1;
                fx.now = 0;
                fx.start = 0;
                fx.end = duration / 12.5;
            }

            var multipler = (fx.now - fx.start) / (fx.end - fx.start);

            if ( o.isMoving && !o.additional.incline ) {

                if ( trace != null && trace != fx.prop )
                    return false;

                var curNewDeg = newDeg;
                var curOldDeg = oldDeg;
                var nowX = oldX - (oldX - newX) * multipler;
                var nowY = oldY - (oldY - newY) * multipler;
                var nowZ = oldZ - (oldZ - newZ) * multipler;
                var nowDeg = curOldDeg - (curOldDeg - curNewDeg) * multipler;
                $( this ).
                    css( '-webkit-transform', 'rotate3d(' + nowX + ',' + nowY + ',' + nowZ + ',' + nowDeg + 'deg)' ).
                    css( '-moz-transform', 'rotate3d(' + nowX + ',' + nowY + ',' + nowZ + ',' + nowDeg + 'deg)' );
                //console.log(fx.prop, fx.start, now, fx.end)
            }


            var nowH = oldH - (oldH - newH) * multipler;

            if ( o.isResizing ) {
                var nowW = oldW - (oldW - newW) * multipler;
                $( this ).css( 'height', nowH + 'px' )
                    .css( 'width', nowW + 'px' );
                //('.power' , this).css('fontSize', nowH/4 + 'px').css('lineHeight', nowH/4 + 'px')
                o._this.instPower( nowH, o );
                o._this.instTeamPower( nowH, o );
                o._this.upSideAndCorner( nowH, o );
            }


            if ( o.isInclining && (!o.isMoving || o.additional.incline) ) {
                var nowXi = oldXi - (oldXi - newXi) * multipler;
                var nowYi = oldYi - (oldYi - newYi) * multipler;
                var nowZi = oldZi - (oldZi - newZi) * multipler;
                var curNewDeg = newDegi;
                var curOldDeg = oldDegi;
                var nowDegi = curOldDeg - (curOldDeg - curNewDeg) * multipler;
                $( this ).
                    css( '-webkit-transform', 'rotate3d(' + nowXi + ',' + nowYi + ',' + nowZi + ',' + nowDegi + 'deg)' ).
                    css( '-moz-transform', 'rotate3d(' + nowXi + ',' + nowYi + ',' + nowZi + ',' + nowDegi + 'deg)' );
            }
            if ( o.additional.intoCard ) {
                if ( 'intoCard' in o.additional && o.additional.intoCard ) {
                    var nowPower = 100 - 8 * multipler;
                    $( '.powerCurrent', this )
                        .css( 'left', 25 - 25 * multipler + '%' );
                    $( '.injuredPower', this )
                        .css( 'opacity', multipler );
                    $( '.cbg', this )
                        .css( 'opacity', multipler );
                    $( '.cardIcon', this )
                        .css( 'opacity', multipler );
                }
            }
            if ( o.additional.outCard ) {
                if ( 'outCard' in o.additional && o.additional.outCard ) {
                    var nowPower = 100 - 8 * multipler;
                    $( '.powerCurrent', this )
                        .css( 'left', 25 * multipler + '%' );
                    $( '.injuredPower', this )
                        .css( 'opacity', 1 - multipler );
                    $( '.cbg', this )
                        .css( 'opacity', 1 - multipler );
                    $( '.cardIcon', this )
                        .css( 'opacity', 1 - multipler );
                }
            }
            if ( o.additional.withIncline ) {
            }

            if ( o.additional.fadeIn ) {
                var multipler2 = multipler * multipler;
                $( this ).css( 'opacity', 1 - multipler2 );
            }

            if ( o.additional.fadeOut ) {
                var multipler2 = multipler * multipler;
                $( this ).css( 'opacity', multipler2 );
            }

            if ( o.additional.curveMoving ) {

                //console.log(o.additional.curveMoving);

                var multiplerX = o.additional.curveMoving === 'X' ? multipler * multipler : multipler;
                var multiplerY = o.additional.curveMoving === 'Y' ? multipler * multipler : multipler;

                var nowXm = oldXm - (oldXm - newXm) * multiplerX;
                var nowYm = oldYm - (oldYm - newYm) * multiplerY;

                $( this ).css( 'top', nowYm + 'px' );
                $( this ).css( 'left', nowXm + 'px' );
            }


            o._this.instMouseControleDown( nowH, o );
        };

    };

    this.moveIncline = function( o ) {

        //console.log(o)
        var deltaX = this.params.position.X > o.X ? this.params.position.X - o.X : o.X - this.params.position.X;
        var deltaY = this.params.position.Y > o.Y ? this.params.position.Y - o.Y : o.Y - this.params.position.Y;
        var trace = deltaY > deltaX ? 'top' : 'left';

        //console.log(this.params.position)
        var yi = this.params.incline.x;
        if ( o.Y !== this.params.position.Y ) {
            yi = o.Y > this.params.position.Y ? -1 : 1;
        }
        var xi = this.params.incline.y;
        if ( o.X !== this.params.position.X ) {
            xi = o.X < this.params.position.X ? -1 : 1;
        }

        return { trace: trace, xm: yi, ym: xi, degm: 45 };
    };

    this.transformToCard = function() {
        console.log( this.$id.css( 'background-color', 'black' ) );
    };

    this.changeZone = function( zona ) {
        this.params.zona = zona;
        return true;
    };

    this.hover = function( onOrOff ) {
        if ( onOrOff ) {
            var onOrOff = onOrOff
        } else {
            var onOrOff = this.params.hover ? false : true;
        }
        if ( this.params.status == 'card' ) {
            switch ( onOrOff ) {
                case true:
                    this.$cbg.css( 'box-shadow', '0px 0px 5px 5px #FFF' );
                    if ( this.params.select )
                        this.$cbg.css( 'box-shadow', ' 0px 0px 0px 2px #0FF , 0px 0px 5px 5px #FFF ' );
                    if ( this.params.zona == 'hand' ) {
                        this.setZIndex( 825 );
                    }
                    break;
                default :
                    if ( this.params.select )
                        this.$cbg.css( 'box-shadow', '0px 0px 0px 2px #0FF' );
                    else
                        this.$cbg.css( 'box-shadow', 'none' );
                    if ( this.params.zona == 'hand' ) {
                        this.setZIndex( 800 );
                    }
                    break;
            }
            this.params.hover = onOrOff;
        }
        if ( this.params.status == 'N' ) {
            switch ( onOrOff ) {
                case true:
                    this.$romb.css( 'box-shadow', '0px 0px 5px 3px #FFF' );
                    if ( this.params.select )
                        this.$romb.css( 'box-shadow', ' 0px 0px 0px 2px #0FF , 0px 0px 5px 3px #FFF' );

                    break;
                default :
                    this.$romb.css( 'box-shadow', 'none' );
                    if ( this.params.select )
                        this.$romb.css( 'box-shadow', '0px 0px 0px 2px #0FF' );
                    break;
            }
            this.params.hover = onOrOff;
        }
        if ( Stadies[S.phase].workingUnit == 'team'
            && (this.params.zona == 'village'
                || this.params.zona == 'attack'
                || this.params.zona == 'block'
                )
            && (!Context.workingUnit || Stadies[S.phase].workingUnit == Context.workingUnit)
            ) {
            var team = S[this.params.owner][this.params.zona].team[this.params.team]
            if ( team ) {
                if ( C[team[0]].params.hover != onOrOff ) {
                    C[team[0]].hover( onOrOff )
                }
                for ( var i = 1; i<= team.length -1; i++ ) {
                    if ( C[team[i]].params.hover != onOrOff ) {
                         C[team[i]].hover( onOrOff )
                    }
                }
            }
        }
    };

    this.select = function( onOrOff ) {
        if ( 0 in arguments ) {
            var onOrOff = onOrOff
        } else {
            var onOrOff = this.params.select ? false : true;
        }
        if ( this.params.status == 'card' ) {
            switch ( onOrOff ) {
                case true:
                    this.$cbg.css( 'box-shadow', '0px 0px 0px 2px #cf681d' );
                    if ( this.params.hover )
                        this.$cbg.css( 'box-shadow', ' 0px 0px 0px 2px #cf681d , 0px 0px 5px 5px #666 ' );
                    break;
                default :
                    if ( this.params.hover )
                        this.$cbg.css( 'box-shadow', '0px 0px 5px 5px #666 ' );
                    else
                        this.$cbg.css( 'box-shadow', 'none' );
                    break;
            }
            this.params.select = onOrOff;
        }
        if ( this.params.status == 'N' ) {
            switch ( onOrOff ) {
                case true:
                    this.$romb.css( 'box-shadow', '0px 0px 0px 2px #0FF' );
                    if ( this.params.hover )
                        this.$romb.css( 'box-shadow', ' 0px 0px 0px 2px #0FF , 0px 0px 5px 3px #FFF ' );
                    break;
                default :
                    if ( this.params.hover )
                        this.$romb.css( 'box-shadow', '0px 0px 5px 5px #FFF ' );
                    else
                        this.$romb.css( 'box-shadow', 'none' );
                    break;
            }
            this.params.select = onOrOff;
        }
        if ( Stadies[S.phase].workingUnit === 'team'
            && (this.params.zona == 'village'
                || this.params.zona == 'attack'
                || this.params.zona == 'block'
                ) ) {
            var team = S[this.params.owner][this.params.zona].team[this.params.team]

            if ( team ) {
                if ( C[team[0]].params.select != onOrOff ) {
                    C[team[0]].select( onOrOff )
                }
                for ( var i = 1; i<= team.length -1; i++ ) {
                    if ( C[team[i]].params.select != onOrOff ) {
                         C[team[i]].select( onOrOff )
                    }
                }
            }
        }
    };

    this.destroyCard = function() {
        this.$id.remove();
    };

    this.onOff3D( 'off' );

    this.hidePrewiev = function() {
        if ( !this.params.prewiev )
            return true;
        $( '#cadrPrewiev' + this.id ).remove();
        this.params.prewiev = false;
    };

    this.showPrewiev = function() {
        if ( this.params.prewiev || !this.params.faceUp)
            return true;
        var offset = this.$id.offset();
        var X = offset.top - (this.params.H * 4 / 92);
        var Y = (offset.left + this.params.H + (this.params.H / 20));
        var H = 150;
        var W = I.card.W * 3;
        var hc = this.params.hc;
        var ec = this.params.ec;
        var $prew = $( '<div />', {
            'class': 'cardPrewievWrap',
            'id': 'cadrPrewiev' + this.id
        } )
            .css( 'height', H )
            .css( 'width', W + 'px' )
            .css( 'font-size', I.card.W / 8 + 'px' );

        //console.log( I.H,I.card.H ,H , this.params.H )
        var topPrew = X - H - this.params.H / 20;
        if ( topPrew + H > I.H - I.card.W ) topPrew = I.H - I.card.W - H - this.params.H / 20;
        //console.log(topPrew,I.H - I.card.W )
        if ( this.params.zona == 'hand' ) {
            $prew
                .css( 'top', topPrew + 'px' )
                .
                css( 'left', (Y - (this.params.H + W) / 2 - this.params.H / 20) + 'px' )

        } else {
            if ( Y + I.card.W * 3 + 5 > I.W ) {
                Y = offset.left - (this.params.H / 20) - I.card.W * 3;
            }
            $prew
                .css( 'top', X + 'px' )
                .css( 'left', Y + 'px' )
        }
        $( '#prewiev' ).append( $prew );
        $prew
        .append(
            $('<table />', {'border':0,'cellpadding':0,'cellspacing':0,'cols':3, 'width':'100%'}).append(
                $('<tbody />', {'valign':'top'}).append(
                    $('<tr />', {}).append(
                        $('<td />', {'colspan':8}).append(
                            $('<h3 />', {'text':this.params.name})
                        )
                    ).append(
                        $('<td />', {'width':'2em'}).append(
                            $('<img />', {'src':'public/pics/H'+hc+'.png', 'width':'2em','height':'2em', 'margin-top':'-5px'})
                        )
                    ).append(
                        $('<td />', {'width':'2em'}).append(
                            $('<img />', {'src':'public/pics/T'+ec+'.png', 'width':'2em','height':'2em', 'margin-top':'-5px'})
                        )
                    )
                )
            )
            
        )
        .append(
            $('<p>',{'text':' '})
        )
        .append(
            $('<table />', {'border':0,'cellpadding':0,'cellspacing':0,'cols':9, 'width':'100%'}).append(
                $('<tbody />', {'valign':'top'}).append(
                    $('<tr />', {}).append(
                        $('<td />', {'colspan':3}).append(
                            $('<h6 />', {'text':'Здоровый'})
                        )
                    ).append(
                        $('<td />', {'colspan':3}).append(
                            $('<h6/>', {'text':'Атрибут'})
                        )
                    ).append(
                        $('<td />', {'colspan':3}).append(
                            $('<h6 />', {'text':'Раненный'})
                        )
                    ).css('text-align','center')
                ).append(
                    $('<tr />', {}).append(
                        $('<td />', {'colspan':3}).append(
                            $('<h3 />', {'class':'normalPower','text':this.params.ah + '/' + this.params.sh})
                        )
                    ).append(
                        $('<td />', {'colspan':3}).append(
                            $('<h3 />', {'text':'-=-'})
                        )
                    ).append(
                        $('<td />', {'colspan':3}).append(
                            $('<h3 />', {'class':'power powerInjured','text':this.params.ai + '/' + this.params.si})
                        )
                    ).css('text-align','center')
                )
            )
            
        )
        this.params.prewiev = true;
    };

    this.setZIndex = function( ind ) {
        var ind = ind ||  this.params.zindex || 0;
        this.$id.css( 'z-index', Number( ind ) );
        this.params.zindex = ind;
        if (this.params.incline.x == 0
            && this.params.incline.y == 0
            && this.params.incline.z == 0
            && this.params.incline.deg == 0
        ) { 
            this.$mouse.css( '-webkit-transform', 'translate3d(0,0,' + (ind) + 'px )' );
            this.$mouse.css( '-moz-transform', 'translate3d(0,0,' + (ind) + 'px )' );
        }
        else {
            this.$mouse.css( '-webkit-transform', 'translate3d(0,0,' + (3) + 'px )' );
            this.$mouse.css( '-moz-transform', 'translate3d(0,0,' + (3) + 'px )' );
        }
    };
    this.setZIndex()

    this.flip = function() {
        if ( this.params.faceUp ) {
            this.flipDown();
        }
        else {
            this.flipUp();
        }
    };

    this.flipUp = function() {
        if ( this.params.faceUp )
            return false;
        this.setAllParams();
        var _this = C[this.id];
        this.animation( { y: 1, deg: -90,
            after: {
                func: (function() {
                    return function() {
                        console.log(1,_this)
                        var _this = _this;
                        _this.$id.empty();
                        _this.fillAsFaceUp( _this.$id );
                        _this.updateLinks();
                        _this.updateMouse();
                        _this.animation( { y: 1, deg: 0 } );
                    }
                })()
            }
        }
        );
        this.params.faceUp = true;
    }

    this.flipDown = function() {
        if ( !this.params.faceUp )
            return false;
        var _this = this;
        this.animation( { y: 1, deg: -90,
            after: {
                func: (function() {
                    return function() {
                        _this.$id.empty();
                        _this.fillAsFaceDown( _this.$id );
                        _this.updateLinks();
                        _this.updateMouse();
                        _this.animation( { y: 1, deg: 0 } );
                    };
                })()
            }
        }
        );
        this.params.faceUp = false;
    };

    this.play = function() {

        //Переместит в преразыгранную зону
        //Превратить в объект
        this.changeZone( 'movingPrePlay' );
        this.animation( {
            'X': I.W / 2 - I.card.W / 2,
            'Y': I.H * 2 / 3 - I.card.W / 2,
            'W': I.card.W,
            x: 0, y: 0, z: 0, deg: 0,
            duration: 1000,
            additional: { curveMoving: 'Y', outCard: true }
        } )
        //Переместить согдасно типу
        createteam( { leader: [ this ], support: [ ], width: 300 } );
    }

    this.click = function() {
        if ( Context.clickAction ) {
            Context.clickAction( this )
        }
        else if ( Stadies[S.phase].clickAction ) {
            Stadies[S.phase].clickAction( this );
        } else {
            if ( Stadies[S.phase].workingUnit === 'card'
                && !this.params.action ) {
                this.showAction();
            }
            this.select();
        }

    }

    this.addTeamPower = function( player ) {
        LogI['addTeamPower'] = 0;
        Log( 1, 'addTeamPower' );
        if ( this.params.teamPosition != 'leader' ) {
            Log( 0, 'teamPosition', this.params.teamPosition );
            Log( -1, 'addTeamPower' );
            return false;
        }
        if ( this.params.isDisplayeTeamPower ) {
            Log( 0, 'isDisplayeTeamPower', this.params.isDisplayeTeamPower );
            Log( -1, 'addTeamPower' );
            $( '.' + player + 'TeamPower', this.$id ).remove();
        }
        var player = player || 'you';
        this.$outShell.append(
            $( '<div>', {
                text: this.getTeamPower(),
                class: player + 'TeamPower shadow'
            } )
            )
        this.instTeamPower( this.params.W, { '_this': this } );
        this.params.isDisplayeTeamPower = true;
        Log( -1, 'addTeamPower' );
    };

    this.removeTeamPower = function( player ) {
        Log( 1, 'removeTeamPower' );
        if ( !this.params.isDisplayeTeamPower ) {
            Log( 0, 'isDisplayeTeamPower', this.params.isDisplayeTeamPower );
            Log( -1, 'removeTeamPower' );
            return false;
        }
        if ( this.params.teamPosition == 'leader' ) {
            Log( 0, 'teamPosition', this.params.teamPosition );
            Log( -1, 'removeTeamPower' );
            return false;
        }
        var player = player || 'you';
        $( '.' + player + 'TeamPower', this.$outShell ).remove();
        this.params.isDisplayeTeamPower = false;
        Log( -1, 'removeTeamPower' );
    };

    this.getTeamPower = function() {
        Log( 1, 'getTeamPower' );
        var result = 0;
        var team = getLinkOnTeam( this );
        result += C[team[0]].getNinjaPower();
        for (var i=1;i<=team.length-1;i++) {
            result += C[team[i]].getNinjaPower();
        }
        Log( -1, 'getTeamPower' );
        return result;
    };


    this.getNinjaPower = function() {
        Log( 1, 'getNinjaPower' );
        var result = 0;
        switch ( this.params.teamPosition ) {
            case 'leader':
                result = this.params.isHealt ? this.params.ah : this.params.ai;
                break;
            case 'support':
                result = this.params.isHealt ? this.params.sh : this.params.si;
                break;
        }

        Log( -1, 'getNinjaPower' );
        return result;
    };


    this.injure = function() {
        LogI['injure'] = 0;
        Log( 1, 'injure' );
        var result = 0;
        //if ( this.params.isHealt ) {
            $( '.center.ceb', this.$romb ).append(
                $( '<div />', {
                    'class': 'injured',
                } )
                )
            this.$power.addClass( 'powerInjured' );
            this.$power.html(Actions.getInjuredPower({cardID:this.id,S:S, Accordance:Accordance,Known:Known}));

            this.params.isHealt = false;
        //}
        Log( -1, 'injure' );
        return result;
    };

    this.showAction = function() {
        Log( 1, 'showAction' );

        var offset = this.$id.offset()

        var $c = $( '<div />', {
            "id": "cardAction" + this.id,
            "text": '',
            "class": "actionCircle"
        } )
            .css( 'width', 0 )
            .css( 'height', 0 )
            .css( 'top', offset.top + this.params.W / 2 )
            .css( 'left', offset.left + this.params.W / 2 )

        if ( Card.prototype.displayedActionCircle ) {
            Card.prototype.displayedActionCircle.hideAction();
        }
        Card.prototype.displayedActionCircle = this;

        var cardId0 = this.id;
        var func = (function() {
            var cardId = cardId0;
            return function() {
                C[cardId].hideAction();
            }
        })();
        $c.append( $( '<div />', {
            "click": func,
            "class": "actionClose"
        } ) )
        this.params.action = true;
        $( '#action' ).append( $c );
        this.actionFill( $c );
        $c.animate( {
            'width': I.card.W,
            'height': I.card.W,
            'top': offset.top + this.params.W / 2 - I.card.W / 2,
            'left': offset.left + this.params.W / 2 - I.card.W / 2
        }, {
            'duration': 125,
        } )
        Log( -1, 'showAction' );
    }

    this.actionFill = function( $c ) {
        var $c = $c || $( '#cardAction' + this.id );
        var id = this.id;
        var obj = {
            S:S,
            pX:you,
            card: this.id,
            Known: Known,
            Accordance : Accordance
        }
        if (Can.putInPlay(obj)) {
             $c.append( $( '<div />', {
                class: 'actionIcon n1 putInPlay',
                'click': (function() {
                    return function() {
                        C[id].putInPlay();
                    }
                })()
            }))
        }
        if (Can.charge(obj)) {
            $c.append( $( '<div />', {
                class: 'actionIcon n2 charge',
                'click': (function() {
                    return function() {
                        C[id].charge();
                    }
                })()
            }))
        }
        if ( G.selectedCard && this.id != G.selectedCard.id ) {
            var id = this.id;
                obj.c2 = this.getMainParams();
                obj.c1 = G.selectedCard.getMainParams();
                console.log(this.id, G.selectedCard.id)
                if (Can.orgAddToTeam(obj)) {
                    $c.append(
                        $( '<div />', {
                            class: 'actionIcon n1 addToTeam',
                            'click': (function() {
                                return function() {
                                    C[id].hideAction();
                                    C[id].addToTeam();
                                }
                            })()
                        } ) )
                }
                if (Can.orgChangeInTeam(obj)) {
                    $c.append( 
                        $( '<div />', {
                            class: 'actionIcon n2 changeInTeam',
                            'click': (function() {
                                return function() {
                                    C[id].hideAction();
                                    socket.emit('changeInTeam',{
                                        u:Client, 
                                        arg:{
                                            c1 : G.selectedCard.getMainParams(),
                                            c2 : C[id].getMainParams(),
                                            pX : you
                                        }
                                    })
                                }
                            })()
                        } ) )
                }
        }
    }

    this.putInPlay = function() {
        Log( 1, 'putInPlay' );
        this.hideAction();
        socket.emit('putInPlay',{
            u:Client, 
            arg:{card: this.id, 
                from:this.params.zona, 
                owner:this.params.owner}
        })
        Log( -1, 'putInPlay' );
    }
    this.charge = function() {
        this.hideAction();
        socket.emit('charge',{
            u:Client, 
            arg:{card: this.id, 
                from:this.params.zona, 
                owner:this.params.owner}
        })
    }
    this.removeFromTeam = function(to) {
        var to = to || this.params.zona;
        socket.emit('removeFromTeam',{
            u:Client, 
            arg:{
                card : this.id,
                from : this.params.zona,
                pX : this.params.owner,
                team : this.params.team,
                to : to,
            }
        })
    }
    this.addToTeam = function() {
        this.hideAction();
        if (G.selectedCard) {
            socket.emit('addToTeam',{
                u:Client, 
                arg:{
                    c1 : G.selectedCard.getMainParams(),
                    c2 : this.getMainParams(),
                    pX : you
                }
            })
        }
    }

    this.hideAction = function() {
        LogI['hideAction'] = 0
        Log( 1, 'hideAction' );

        var offset = this.$id.offset()
        this.select( false );
        Log( 0, 'tthis.id', this.id );
        if ( !this.params.action ) {
            Log( 0, 'this.params.action', this.params.action );
            Log( -1, 'hideAction' );
            return true;
        }

        Card.prototype.displayedActionCircle = null;

        var cardId0 = this.id;
        var func = (function() {
            var cardId = cardId0;
            return function() {
                $( '#cardAction' + cardId ).remove();
            }
        })();
        $( '#cardAction' + this.id ).animate( {
            'width': 0,
            'height': 0,
            'top': offset.top + this.params.W / 2,
            'left': offset.left + this.params.W / 2
        }, {
            'duration': 125,
            'done': func
        } )
        this.params.action = false;
        Log( -1, 'hideAction' );
    };
}


Card.prototype = {
    displayedActionCircle: null,
    hideActionCircle : function() {
        if ( Card.prototype.displayedActionCircle ) {
            Card.prototype.displayedActionCircle.hideAction();
        }
    },
    getMainParams : function() {
        var result = {
                    card : this.id,
                    zone : this.params.zona,
                    owner : this.params.owner,
                    team : this.params.team,
                    position:this.params.teamPosition
                };
        return result;
    },
    /**
     * Анимационный эффект возникающий над полем
     * @param  {[type]} o [description]
     * @param  {String} o.type Тип анимации simple
     * @param  {String} o.target Над какими элементами должен появиться эффект one
     * @return {[type]}   [description]
     */
    effect : function(o) {
        var _this = this;
        var afterFunc = o.afterFunc || function(){};
        if (o.type == 'simple') {
            if (o.target == 'one') {
                var pic = o.pic || "public/pics/damage.png"; 
                var sprite = $('<div />', {})
                    .css('width', _this.params.W)
                    .css('height', _this.params.H)
                    .css('top', _this.params.position.Y)
                    .css('left', _this.params.position.X)
                    .css('position', 'absolute')
                    .css('opacity',0)
                    .append($('<img />',{
                        src : pic,
                        width :  _this.params.W,
                        height :  _this.params.H,
                    }))
                H.animate.append(sprite);
                sprite.animate({
                        opacity: 1,
                    }, 500, 
                    function() {
                        sprite.animate({
                                opacity: 0,
                            }, 500, 
                            function() {
                                sprite.remove();
                                afterFunc();
                            });
                    });
            }
        }
    }
}
