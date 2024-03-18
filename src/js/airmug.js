'use strict';

(() => {
    let yOffset = 0;//스크롤 위치값(window.pageYOffset)
    let prevScrollHeight = 0; //현재 스크롤 위치보다 이전에 위치한 스크롤 섹션들의 스크롤 높이의 합
    let currentScene = 0; //현재 활성화된(눈 앞에 보고있는) 씬(scen)
    let enterNewScene = false;// 새로운 scene이 시작된 순간 true
    let acc = 0.1;//캔버스 가속도
    let delayedYOffset = 0;//캔버스 딜레이
    let rafId;
    let rafState;

    const sceneInfo = [
        {//0
            type : 'sticky',
            heightNum : 5, // 브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight : 0, // 각 section scroll 높이
            objs : {
                container : document.querySelector('#scroll-section-0'),
                messageA: document.querySelector('#scroll-section-0 .main-message.a'),
                messageB: document.querySelector('#scroll-section-0 .main-message.b'),
                messageC: document.querySelector('#scroll-section-0 .main-message.c'),
                messageD: document.querySelector('#scroll-section-0 .main-message.d'),
                canvas: document.querySelector('#video-canvas-0'),
                context: document.querySelector('#video-canvas-0').getContext('2d'),
                videoImages: []
            },
            values : {
                videoImagesCount: 300,
                imageSequence: [0, 299],
                canvans_opacity: [1, 0, { start: 0.9, end: 1}],
                messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
                messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
                messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
                messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
                messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
                messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
                messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
                messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],
                messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
                messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
                messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
                messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
                messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3 }],
                messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
                messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
                messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }]
            }
        },
        {//1
            type : 'normal',
            // heightNum : 5, // type normal에서는 필요없음
            scrollHeight : 0, // 각 section scroll 높이
            objs : {
                container : document.querySelector('#scroll-section-1')
            }
        },
        {//2
            type : 'sticky',
            heightNum : 5, // 브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight : 0, // 각 section scroll 높이
            objs : {
                container: document.querySelector('#scroll-section-2'),
                messageA: document.querySelector('#scroll-section-2 .a'),
                messageB: document.querySelector('#scroll-section-2 .b'),
                messageC: document.querySelector('#scroll-section-2 .c'),
                pinB: document.querySelector('#scroll-section-2 .b .pin'),
                pinC: document.querySelector('#scroll-section-2 .c .pin'),
                canvas: document.querySelector('#video-canvas-1'),
                context: document.querySelector('#video-canvas-1').getContext('2d'),
                videoImages: []
            },
            values: {
                videoImagesCount: 960,
                imageSequence: [0, 959],
                canvans_opacity_in: [0, 1, { start: 0, end: 0.1}],
                canvans_opacity_out: [1, 0, { start: 0.95, end: 1}],
                messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
                messageB_translateY_in: [30, 0, { start: 0.5, end: 0.55 }],
                messageC_translateY_in: [30, 0, { start: 0.72, end: 0.77 }],
                messageA_opacity_in: [0, 1, { start: 0.15, end: 0.2 }],
                messageB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
                messageC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
                messageA_translateY_out: [0, -20, { start: 0.3, end: 0.35 }],
                messageB_translateY_out: [0, -20, { start: 0.58, end: 0.63 }],
                messageC_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
                messageA_opacity_out: [1, 0, { start: 0.3, end: 0.35 }],
                messageB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
                messageC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
                pinB_scaleY: [0.5, 1, { start: 0.5, end: 0.55 }],
                pinC_scaleY: [0.5, 1, { start: 0.72, end: 0.77 }],
                pinB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
                pinC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
                pinB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
                pinC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }]
            }
        },
        {//3
            type : 'sticky',
            heightNum : 5, // 브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight : 0, // 각 section scroll 높이
            objs : {
                container : document.querySelector('#scroll-section-3'),
                canvasCaption : document.querySelector('.canvas-caption'),
                canvas: document.querySelector('.image-blend-canvas'),
                context : document.querySelector('.image-blend-canvas').getContext('2d'),
                imagePath : [
                    './img/blend-image-1.jpg',
                    './img/blend-image-2.jpg'
                ],
                images : []
            },
            values: {
                rect1X: [0,0, {start: 0, end: 0}],
                rect2X: [0,0, {start: 0, end: 0}],
                blendHeight: [0,0, {start: 0, end: 0}],
                canvas_scale: [0,0, {start: 0, end: 0}],
                canvasCaption_opacity: [0, 1, {start: 0, end: 0}],
                canvasCaption_translateY: [20, 0, {start: 0, end: 0}],
                rectStartY : 0
            }
        }
    ]

    function setCanvasImages() {
        let imgElem;
        for(let i = 0; i < sceneInfo[0].values.videoImagesCount; i++) {
            imgElem = new Image();
            imgElem.src = `./video/001/IMG_${6726 + i}.JPG`;
            sceneInfo[0].objs.videoImages.push(imgElem);
        }
        
        let imgElem2;
        for(let i = 0; i < sceneInfo[2].values.videoImagesCount; i++) {
            imgElem2 = new Image();
            imgElem2.src = `./video/002/IMG_${7027 + i}.JPG`;
            sceneInfo[2].objs.videoImages.push(imgElem2);
        }

        let imgElem3
        for(let i = 0; i < sceneInfo[3].objs.imagePath.length; i++) {
            imgElem3 = new Image();
            imgElem3.src = sceneInfo[3].objs.imagePath[i];
            sceneInfo[3].objs.images.push(imgElem3)
        }
    }

    function checkMenu() {
        if(yOffset > 44) {
            document.body.classList.add('local-nav-sticky')
        } else {
            document.body.classList.remove('local-nav-sticky')
        }
    }

    function setLayout() {
        // 각 스크롤 섹션의 높이 세팅
        for(let i = 0; i < sceneInfo.length; i++) {
            if(sceneInfo[i].type === 'sticky') {
                sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
            } else if(sceneInfo[i].type === 'normal') {
                sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
            }
            sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`
        }

        yOffset = window.pageYOffset;
        let totalScrollHeight = 0;
        for(let i = 0; i < sceneInfo.length; i++) {
            totalScrollHeight += sceneInfo[i].scrollHeight;
            if(totalScrollHeight >= yOffset) {
                currentScene = i;
                break;
            }
        }
        document.body.setAttribute('id', `show-scene-${currentScene}`);

        const heightRatio = window.innerHeight / 1080;
        sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`
        sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`
    }

    //뷰포트(스크롤 scene)에서의 스크롤 위치값
    function calcValues(values, currentYOffset) {
        let rv;
        //현재 scene(스크롤섹션)에서 스크롤된 범위를 비율로 구하기
        const scrollHeight = sceneInfo[currentScene].scrollHeight
        const scrollRatio = currentYOffset / scrollHeight;

        if(values.length === 3) {
            // start ~ end 사이의 애니메이션 실행
            const partScrollStart = values[2].start * scrollHeight;
            const partScrollEnd = values[2].end * scrollHeight;
            const partScrollHeight = partScrollEnd - partScrollStart;

            if(currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {//part 내에서 스크롤 진행 시
                rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0];
            } else if(currentYOffset < partScrollStart) {
                rv = values[0]
            } else if(currentYOffset > partScrollEnd) {
                rv = values[1]
            }
        } else {
            rv = scrollRatio * (values[1] - values[0]) + values[0];
        }

        return rv;
    }

    //뷰포트에 보이는 scene에서만 애니메이션 실행
    function playAnimation() {
        const objs = sceneInfo[currentScene].objs;
        const values = sceneInfo[currentScene].values;
        const currentYOffset = yOffset - prevScrollHeight;//뷰포트(스크롤 scene)에서의 스크롤 위치값
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / scrollHeight //yOffset/현재 scene의 scrollHeight
        // console.log(currentScene)
        switch(currentScene) {
            case 0:
                // let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                // objs.context.drawImage(objs.videoImages[sequence], 0, 0);
                objs.canvas.style.opacity = calcValues(values.canvans_opacity, currentYOffset)

                if (scrollRatio <= 0.22) {
                    // in
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
                }
    
                if (scrollRatio <= 0.42) {
                    // in
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
                }
    
                if (scrollRatio <= 0.62) {
                    // in
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
                }
    
                if (scrollRatio <= 0.82) {
                    // in
                    objs.messageD.style.opacity = calcValues(values.messageD_opacity_in, currentYOffset);
                    objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageD.style.opacity = calcValues(values.messageD_opacity_out, currentYOffset);
                    objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_out, currentYOffset)}%, 0)`;
                }
                break;

                case 2:
                    // let sequence2 = Math.round(calcValues(values.imageSequence, currentYOffset));
                    // objs.context.drawImage(objs.videoImages[sequence2], 0, 0);
                    // objs.canvas.style.opacity = calcValues(values.canvans_opacity, currentYOffset)

                if (scrollRatio <= 0.5) {
                    objs.canvas.style.opacity = calcValues(values.canvans_opacity_in, currentYOffset)
                } else {
                    objs.canvas.style.opacity = calcValues(values.canvans_opacity_out, currentYOffset)
                }

                if (scrollRatio <= 0.25) {
                    // in
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
                }
    
                if (scrollRatio <= 0.57) {
                    // in
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
                    objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
                } else {
                    // out
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
                    objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
                }
    
                if (scrollRatio <= 0.83) {
                    // in
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
                    objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
                } else {
                    // out
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
                    objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
                }

                //currentScene 3에서 사용하는 캔버스를 미리 그려주기 시작
                if(scrollRatio > 0.9) {
                    console.log('currentScene 3에서 사용하는 캔버스를 미리 그려주기 시작')
                    const objs = sceneInfo[3].objs;
                    const values = sceneInfo[3].values;

                    // 가로/세로 모두 꽉차게 하기 위해 여기에 세팅(계산 필요)
                    const widthRatio = window.innerWidth / objs.canvas.width;
                    const heightRatio = window.innerHeight / objs.canvas.height;
                    console.log(widthRatio, heightRatio)
                    // width, height 비율에 따라 얼마큰 나눠줄지 세팅해야 한다
                    let canvasScaleRatio;

                    if(widthRatio <= heightRatio) {
                        canvasScaleRatio = heightRatio
                        console.log('heightRatio 로 결정')
                    } else {
                        canvasScaleRatio = widthRatio
                        console.log('widthRatio 로 결정')
                    }

                    objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
                    objs.context.fillStyle = '#fff';
                    objs.context.drawImage(objs.images[0],0,0);

                    // 캔버스 사이즈에 맞추어 가정한 innerWidth와 innerHeight
                    const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
                    const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

                    // 박스의 x좌표
                    const whiteRectWidth = recalculatedInnerWidth * 0.15; 
                    values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
                    values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
                    values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
                    values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

                    //좌우 흰색 박스 그리기
                    //fillRect(x,y,width,height)
                    objs.context.fillRect(values.rect1X[0], 0, parseInt(whiteRectWidth), objs.canvas.height);
                    objs.context.fillRect(values.rect2X[0], 0, parseInt(whiteRectWidth), objs.canvas.height);
                }
                break;
            case 3:
                console.log('3play')
                let step = 0; //캔버스 이미지 애니메이션

                // 가로/세로 모두 꽉차게 하기 위해 여기에 세팅(계산 필요)
                const widthRatio = window.innerWidth / objs.canvas.width;
                const heightRatio = window.innerHeight / objs.canvas.height;
                console.log(widthRatio, heightRatio)
                // width, height 비율에 따라 얼마큰 나눠줄지 세팅해야 한다
                let canvasScaleRatio;

                if(widthRatio <= heightRatio) {
                    canvasScaleRatio = heightRatio
                    console.log('heightRatio 로 결정')
                } else {
                    canvasScaleRatio = widthRatio
                    console.log('widthRatio 로 결정')
                }

                objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
                objs.context.fillStyle = '#fff';
                objs.context.drawImage(objs.images[0],0,0);

                // 캔버스 사이즈에 맞추어 가정한 innerWidth와 innerHeight
                const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
                const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

                if(!values.rectStartY) {
                    //값이 안들어있을 때 세팅 : 한 번 세팅되고 나서는 다시 실행되지 않음
                    // values.rectStartY = objs.canvas.getBoundingClientRect().top; - 스크롤 속도에 따라 오차가 발생함
                    values.rectStartY = objs.canvas.offsetTop + (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;

                    values.rect1X[2].start = (window.innerHeight / 2) /scrollHeight;
                    values.rect2X[2].start = (window.innerHeight / 2) /scrollHeight;
                    values.rect1X[2].end = values.rectStartY / scrollHeight;
                    values.rect2X[2].end = values.rectStartY / scrollHeight;
                }

                const whiteRectWidth = recalculatedInnerWidth * 0.15; 
                values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
                values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
                values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
                values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

                //좌우 흰색 박스 그리기
                //fillRect(x,y,width,height)
                // objs.context.fillRect(values.rect1X[0], 0, parseInt(whiteRectWidth), objs.canvas.height);
                // objs.context.fillRect(values.rect2X[0], 0, parseInt(whiteRectWidth), objs.canvas.height);
                objs.context.fillRect(
                    parseInt(calcValues(values.rect1X, currentYOffset)),//x값이 애니메이션 실행되면서 변할 수 있도록 calcValues 함수 이용
                    0,
                    parseInt(whiteRectWidth),
                    objs.canvas.height
                );
                objs.context.fillRect(
                    parseInt(calcValues(values.rect2X, currentYOffset)),
                    0, 
                    parseInt(whiteRectWidth),
                    objs.canvas.height
                    );

                if(scrollRatio < values.rect1X[2].end) {
                    //첫번째 캔버스 대상의 scrollRatio가 end 시점보다 작다면
                    step = 1;
                    objs.canvas.classList.remove('sticky');
                } else {
                    step = 2;
                    //첫번째 캔버스가 viewport상단에 닿았을 때, 이미지 블랜드 등장
                    //blendHeight: [0,0, {start: 0, end: 0}]
                    values.blendHeight[0] = 0;//초기값
                    values.blendHeight[1] = objs.canvas.height;
                    values.blendHeight[2].start = values.rect1X[2].end;
                    values.blendHeight[2].end = values.blendHeight[2].start + 0.2;
                    const blendHeight = calcValues(values.blendHeight, currentYOffset)

                    objs.context.drawImage(objs.images[1],//이미지주소
                        0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight,//원본 이미지 위치 및 크기
                        0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight //캔버스에서 그리는 이미지 위치 및 크기
                    )
                    objs.canvas.classList.add('sticky');
                    objs.canvas.style.top = `${-(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2}px`;
                    objs.canvas.style.marginTop = 0;

                    //두번째 캔버스가 축소되는 움직임
                    if(scrollRatio > values.blendHeight[2].end) {
                        values.canvas_scale[0] = canvasScaleRatio;
                        values.canvas_scale[1] = document.body.offsetWidth / (1.5 * objs.canvas.width);
                        values.canvas_scale[2].start = values.blendHeight[2].end;
                        values.canvas_scale[2].end = values.canvas_scale[2].start + 0.2;

                        objs.canvas.style.transform = `scale(${calcValues(values.canvas_scale, currentYOffset)})`;
                        // objs.canvas.style.marginTop = 0;
                    }
                    //두번째 캔버스가 축소가 완료된 후 움직임
                    if(scrollRatio > values.canvas_scale[2].end && values.canvas_scale[2].end > 0) {
                        objs.canvas.classList.remove('sticky');
                        objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`//스크롤된 만큼 길이 canvas1이 동작하는 길이(0.2) + canvas2 동작하는 길이(0.2);

                        //두번째 캔버스 축소 후 텍스트 모션
                        values.canvasCaption_opacity[2].start = values.canvas_scale[2].end;
                        values.canvasCaption_opacity[2].end = values.canvasCaption_opacity[2].start + 0.1;
                        objs.canvasCaption.style.opacity = calcValues(values.canvasCaption_opacity, currentYOffset);

                        values.canvasCaption_translateY[2].start = values.canvasCaption_opacity[2].start;
                        values.canvasCaption_translateY[2].end = values.canvasCaption_opacity[2].end;
                        objs.canvasCaption.style.transform = `translate3d(0, ${calcValues(values.canvasCaption_translateY, currentYOffset)}%, 0)`
                    } else {
                        objs.canvas.style.marginTop = 0;
                        objs.canvasCaption.style.opacity = values.canvasCaption_opacity[0];
                    }
                }
                break;
        }
    }

    //스크롤하면 시행되는 기능
    function scrollLoop() {
        enterNewScene = false;//씬이 바뀌는 순간
        prevScrollHeight = 0;
        //각 section의 높이의 합이 현재위치값(yOffset)보다 크면 다음 section이 시작되었다!!
        // for(let i = 0; i < sceneInfo.length; i++) {
        //     prevScrollHeight += sceneInfo[i].scrollHeight;//scroll 할때마다 값이 초기화되지 않음, 값이 누적됨
        // }

        //내가 스크롤하고 있는 곳의 scene
        for(let i = 0; i < currentScene; i++) {
            prevScrollHeight += sceneInfo[i].scrollHeight;//scroll 할때마다 값이 초기화되지 않음, 값이 누적됨
        }
        if(delayedYOffset < prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
            document.body.classList.remove('scroll-effect-end')
        }

        if(delayedYOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
            enterNewScene = true;
            if(currentScene === sceneInfo.length -1) {//section.normal-content노출 시 sticky 요소를 감추기 위함
                document.body.classList.add('scroll-effect-end')
                // document.body.removeAttribute('id') 아이디를 제거할 경우, 역스크롤 시 id값을 주는 버그 수정필요
            }
            if(currentScene < sceneInfo.length - 1) {//스크롤 효과가 없는 하단 section.normal-content에서의 console error 대응
                currentScene++;
            }
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }
        if(delayedYOffset < prevScrollHeight) {
            enterNewScene = true;
            if(currentScene === 0) return;//페이지 최상단에서 스크롤 바운스가 있는 경우 - currentScene이 0일때, yoffset이 마이너스 값이 되어버린다.(모바일에서 일어날 수 있음)
            currentScene--;
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }

        // console.log(`이전 씬 스크롤 합 : ${prevScrollHeight}`);
        // console.log(`현재 스크롤 위치 : ${yOffset}`)
        // console.log(`현재 섹션 : ${currentScene}`)
        if(enterNewScene) return; // 이전 scene으로 넘어갈때 마이너스 값 제거
        playAnimation()
    }

    function loop() {
        delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;

        if(!enterNewScene && (currentScene === 0 || currentScene === 2)) {
            const currentYOffset = delayedYOffset - prevScrollHeight;
            const objs = sceneInfo[currentScene].objs;
            const values = sceneInfo[currentScene].values;
            let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));

            console.log(currentScene)

            if(objs.videoImages[sequence]) {
                objs.context.drawImage(objs.videoImages[sequence], 0, 0);
                console.log(sequence)
            }
        }

        rafId = requestAnimationFrame(loop)

        if(Math.abs(yOffset - delayedYOffset) < 1) {
            cancelAnimationFrame(rafId)
            rafState = false;
        }
    }

    //로드가 완료된 이후에 이벤트들이 실행될 수 있도록, load 이벤트 안에 이벤트 핸들러를 적용(init() 함수를 별개로 만들어서 사용도 가능함)
    window.addEventListener('load', () => {
        document.body.classList.remove('before-load');
        setLayout()
        sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0);

        //bugFix중간 로딩되었을 때 캔버스를 그리기 위해 - 살짝 스크롤되도록
        let tempYOffset = yOffset;
        let tempScrollCount = 0;
        if(yOffset > 0) {
            let siId = setInterval(() => {
                window.scrollTo(0, tempYOffset);
                tempYOffset += 5;//5px씩 더함
                console.log(tempYOffset)
    
                if(tempScrollCount > 20) {
                    clearInterval(siId)
                }
    
                tempScrollCount++
            }, 20)
        }

        window.addEventListener('scroll', () => {
            yOffset = window.pageYOffset;
            scrollLoop();
            checkMenu();

            if(!rafState) {
                rafId = requestAnimationFrame(loop);
                rafState = true;
            }
        })
        window.addEventListener('resize', () => {
            if(window.innerWidth > 900) {
                window.location.reload()
            }
        })
        window.addEventListener('orientationchange', () => {
            scrollTo(0, 0);//스크롤을 위로 올려줌
            setTimeout(() => {
                window.location.reload()
            })
        })//모바일 가로버전을 사용했을 때

        document.querySelector('.loading').addEventListener('transitionend', (e) => {
            document.body.removeChild(e.currentTarget);
        })//로딩이 완료된 후(transition이 끝난후) div.loading이 자연스럽게 제거될 수 있도록
    })//웹페이지의 이미지 등 전체가 로드되고 나서 실행되는 이벤트

    setCanvasImages()
    // window.addEventListener('DomContentLoaded', setLayout)
    // setLayout()
})()