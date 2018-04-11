(function () {
    window.tools = {

        // cols>=2  rows>=2 且最好是偶数，cols也不宜设置太大，因为想1、l、i 这种字符，宽度太小
        // 设置的值并非越大越精确，因为验证码字符本身有效字符就比较少，如果再切分的太细，反而会放大误差
        splitObj: {cols: 4, rows: 8},

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

            var col = ratio[0].length;
            var row = ratio.length;
            var midCol = col / 2;
            var midRow = row / 2;

            var obj = {left: [], right: [], bottom: [], top: []};
            for (var i = 0; i < row; i++) {
                for (var j = 0; j < col; j++) {
                    var val = ratio[i][j].rr;
                    if (i < midRow) {
                        obj.top.push(val);
                    } else {
                        obj.bottom.push(val);
                    }
                    if (j < midCol) {
                        obj.left.push(val);
                    } else {
                        obj.right.push(val);
                    }
                }
            }
            // 合并成一个值
            for (var key in obj) {
                var arr = obj[key];
                var sum = 0;
                arr.forEach(function (n, i) {
                    sum += n;
                });
                obj[key.charAt(0)] = sum;
            }
            return {pieces: ratio, blocks: obj};
        },

        // 比较两个对象的值
        compareSingle: function (target, stand) {
            var tar = target.pieces;
            var ori = stand.pieces;
            var col = tar[0].length;
            var row = tar.length;

            var error = {
                single: [],
                hor: [],
                ver: [],
                top: [],
                left: [],
                bottom: [],
                right: []
            }; // 误差
            var i, j, val, val1, sum = 0, diff;

            // 1.挨个值比较
            tar.forEach(function (rows, i) {
                error.single[i] = [];
                rows.forEach(function (val, j) {
                    var oriRR = ori[i][j].rr;
                    var a = val.rr - oriRR;
                    error.single[i][j] = a * a;
                });
            });

            // 2.上下左右比较  1/2
            var blocksRatio = 0;
            var b1 = target.blocks;
            var b2 = stand.blocks;
            var arr = ["left", "right", "top", "bottom"];
            for (var i = 0, len = arr.length; i < len; i++) {
                var k = arr[i];
                var ck = k.charAt(0);
                var a = b1[ck] - b2[ck];
                error[k] = a * a;
                blocksRatio += error[k];
            }

            // 3.水平竖直比较
            sum = 0;
            for (i = 0; i < row; i++) {
                for (j = 0; j < col; j++) {
                    val = tar[i][j].rr;
                    val1 = ori[i][j].rr;
                    a = val - val1;
                    sum += a * a;
                }
                error.hor.push(sum);
            }
            /*for (i = 0; i < row; i++) {
                error.ver[i] = [];
                for (j = 0; j < col; j++) {
                    error.ver[i][j] = [];
                }
            }
            for (i = 0; i < col; i++) {
                for (j = 0; j < row; j++) {
                    val = tar[j][i].rr;
                    val1 = ori[j][i].rr;
                    error.ver[j][i] = val - val1;
                }
            }*/
            sum = 0;
            for (i = 0; i < col; i++) {
                for (j = 0; j < row; j++) {
                    val = tar[j][i].rr;
                    val1 = ori[j][i].rr;
                    a = val - val1;
                    sum += a * a;
                }
                error.ver.push(sum);
            }

            // 4. 对角
            // pass

            // 对误差进行测算
            var result = {single: 0, ver: 0, hor: 0};
            error.single.forEach(function (arr, i) {
                arr.forEach(function (num, j) {
                    //console.log(result.single, num);
                    result.single += num;
                });
            });
            error.hor.forEach(function (num, i) {
                result.hor += num;
            });
            error.ver.forEach(function (num, i) {
                result.ver += num;
            });

            return {ratio: result.single + result.ver * col + result.hor * row + blocksRatio, error: error};
        },

        // 循环总的字符源数据 和 当前的数据比较
        compare: function (singleObj) {
            var compareSingle = tools.compareSingle;
            var oriMap = window.charRatio;
            var resArr = [];
            for (var key in oriMap) {
                var r = compareSingle(singleObj, oriMap[key]);
                r.key = key;
                resArr.push(r);
            }
            return resArr;
        }
    };
})();

