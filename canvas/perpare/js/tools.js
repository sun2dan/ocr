(function () {
    window.tools = {

        // https://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
        PIXEL_RATIO: (function () {
            var ctx = document.createElement("canvas").getContext("2d"),
                dpr = window.devicePixelRatio || 1,
                bsr = ctx.webkitBackingStorePixelRatio ||
                    ctx.mozBackingStorePixelRatio ||
                    ctx.msBackingStorePixelRatio ||
                    ctx.oBackingStorePixelRatio ||
                    ctx.backingStorePixelRatio || 1;

            //console.log(dpr / bsr);
            return dpr / bsr;
        })(),

        // 创建canvas
        createHiDPICanvas: function (w, h, ratio) {
            if (!ratio) {
                ratio = tools.PIXEL_RATIO;
            }
            var can = document.createElement("canvas");
            can.width = w * ratio;
            can.height = h * ratio;
            can.style.width = w + "px";
            can.style.height = h + "px";
            can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
            return can;
        },

        // 按照字符边界切割canvas
        cutCanvasByBorder: function (canvas) {
            var ctx = canvas.getContext("2d");
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var range = boundary.init(imageData);
            //ctx.fillStyle = "rgba(0,0,255, .7)";
            //ctx.fillRect(range.l, range.t, range.w, range.h);
            ctx.strokeStyle = "rgba(255,0,0, .5)";
            ctx.lineWidth = 1;
            //ctx.strokeRect(range.l, range.t, range.w, range.h);

            var code = canvas.getAttribute("value");
            var imgData = ctx.getImageData(range.l, range.t, range.w, range.h);
            var cans = document.createElement("canvas");
            cans.width = imgData.width;
            cans.height = imgData.height;
            cans.getContext("2d").putImageData(imgData, 0, 0);
            cans.setAttribute("value", code);

            /*var img = document.createElement("img");
            img.src = cans.toDataURL("image/png");
            img.setAttribute("value", code);*/
            return cans;
        },

        //  格式化数据
        formatData: function (imageData) {
            var w = imageData.width;
            var h = imageData.height;
            var data = imageData.data;
            var pixInfo = [];

            for (var y = 0; y < h; y++) {
                var arr = [];
                for (var x = 0; x < w; x++) {
                    var i = 4 * x + 4 * y * w;
                    arr.push({
                        r: data[i],
                        g: data[i + 1],
                        b: data[i + 2],
                        a: data[i + 3],
                        x: x,
                        y: y,
                        index: i / 4
                    });
                }
                pixInfo.push(arr);
            }

            return pixInfo;
        },

        // 是否为有效的色值
        isValidColor: function (obj) {
            var flag = obj.r === 255 && obj.g === 255 && obj.b === 255;
            return !flag;
        },

        // 分割canvas
        splitToBlock: function (list, splitObj) {
            var areaArr = [];
            splitObj = splitObj || {};
            var cols = splitObj.cols || 2;
            var rows = splitObj.rows || 2;
            var hor = list[0].length; // 水平
            var ver = list.length;    // 竖直
            var step = {
                hor: parseInt(hor / cols),
                ver: parseInt(ver / rows)
            };
            for (var i = 0; i < rows; i++) {
                areaArr[i] = [];
                for (var j = 0; j < cols; j++) {
                    areaArr[i][j] = [];
                }
            }
            list.forEach(function (arr, y) {
                arr.forEach(function (obj, x) {
                    var xindex = parseInt(x / step.hor);
                    var yindex = parseInt(y / step.ver);
                    if (xindex >= cols) xindex = cols - 1;
                    if (yindex >= rows) yindex = rows - 1;
                    areaArr[yindex][xindex].push(obj);
                });
            });
            return areaArr;
        },

        // 计算占比
        calcRatio: function (areaArr) {
            var ratio = [];
            var sumValid = 0;
            areaArr.forEach(function (arr, i) {
                ratio[i] = [];
                arr.forEach(function (ar, j) {
                    ratio[i][j] = [];
                    // 单独一个模块
                    var idx = 0;
                    ar.forEach(function (obj, h) {
                        if (tools.isValidColor(obj)) {
                            idx++;
                            sumValid++;
                        }
                    });
                    var sum = ar.length;
                    // r: 当前区域占比; rr: 有效区域占比
                    ratio[i][j] = {r: idx / sum * 100, valid: idx, sum: sum};
                });
            });
            ratio.forEach(function (arr, i) {
                arr.forEach(function (item, j) {
                    item.rr = item.valid / sumValid * 100;
                    item.validSum = sumValid;
                });
            });
            //console.log(ratio);
            return ratio;
        },

        // 获取各区域占比快捷入口
        getRatio: function (imgData, splitObj) {
            var formatList = tools.formatData(imgData);
            var areaArr = tools.splitToBlock(formatList, splitObj);
            var ratio = tools.calcRatio(areaArr);
            return ratio;
        },
    };
})();

