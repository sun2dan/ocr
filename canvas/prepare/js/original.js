/**
 * 获取样本
 * */
(function () {// 页面初始化准备工作
    var codes = [[65, 90], [97, 122], [48, 57]];
    var createHiDPICanvas = tools.createHiDPICanvas;
    var fontStyle = 'normal 50px Arial';
    fontStyle = 'normal 50px Microsoft YaHei';

    window.page = {
        // 创建canvas列表
        createCanvasList: function () {
            var size = {w: 60, h: 60};
            var w = size.w;
            var h = size.h;
            var $page = $(".page");

            this.charArr.forEach(function (arr, i) {
                var $box = $('<div class="box"></div>');

                arr.forEach(function (c, j) {
                    var can = createHiDPICanvas(size.w, size.h);
                    can.setAttribute("value", c);
                    var ctx = can.getContext('2d');
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(0, 0, can.width, can.height);
                    ctx.font = fontStyle;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#000';
                    ctx.fillText(c, w / 2, h / 2, w);

                    $box.append(can);
                });
                $page.append($box);
            });
        },

        // 创建字符集
        createCharSet: function () {
            // 大小写一致的只保留大写
            var filterArr = ['c', 'o', 'p', 's', 'u', 'v', 'w', 'x', 'z'];

            var charArr = [[], [], []];
            codes.forEach(function (arr, index) {
                for (var i = arr[0]; i <= arr[1]; i++) {
                    var c = String.fromCharCode(i);
                    isFilter(c) && charArr[index].push(c);
                }
            });
            this.charArr = charArr;

            //console.log(charArr);

            function isFilter(code) {
                for (var i = 0, len = filterArr.length; i < len; i++) {
                    var c = filterArr[i];
                    if (c === code) return false;
                }
                return true;
            }
        },

        init: function () {
            this.createCharSet();
            this.createCanvasList();
        }
    };

    // 字符边界
    window.boundary = {
        pixInfo: [],

        // 获取四个边界
        getTop: function () {
            var pixInfo = this.pixInfo;
            for (var i = 0, len = pixInfo.length; i < len; i++) {
                var arr = pixInfo[i];
                for (var j = 0, leng = arr.length; j < leng; j++) {
                    var obj = arr[j];
                    if (tools.isValidColor(obj)) {
                        return obj.y;
                    }
                }
            }
            return 0;
        },
        getRight: function () {
            var pixInfo = this.pixInfo;
            var hor = pixInfo[0].length;
            var ver = pixInfo.length;

            for (var i = hor - 1; i >= 0; i--) {
                for (var j = ver - 1; j >= 0; j--) {
                    var obj = pixInfo[j][i];
                    if (tools.isValidColor(obj)) {
                        return obj.x;
                    }
                }
            }
            return 0;
        },
        getBottom: function () {
            var pixInfo = this.pixInfo;
            for (var i = pixInfo.length - 1; i >= 0; i--) {
                var arr = pixInfo[i];
                for (var j = 0, leng = arr.length; j < leng; j++) {
                    var obj = arr[j];
                    if (tools.isValidColor(obj)) {
                        return obj.y;
                    }
                }
            }
            return 0;
        },
        getLeft: function () {
            var pixInfo = this.pixInfo;
            var hor = pixInfo[0].length;
            var ver = pixInfo.length;

            for (var i = 0; i < hor; i++) {
                for (var j = 0; j < ver; j++) {
                    var obj = pixInfo[j][i];
                    if (tools.isValidColor(obj)) {
                        return obj.x;
                    }
                }
            }
            return 0;
        },

        // 入口
        init: function (imageData) {
            var self = this;
            this.pixInfo = tools.formatData(imageData);
            var range = {
                t: self.getTop(),
                r: self.getRight(),
                b: self.getBottom(),
                l: self.getLeft()
            };
            range.w = range.r + 1 - range.l;
            range.h = range.b + 1 - range.t;
            //console.log(range);
            return range;
        }
    };


    main();

    // 获取源数据
    function main() {
        var $clipBox = $(".clip-box");

        page.init();
        main();
        second();         // 解析分割出来的canvas

        function main() {
            // 获取边界
            // 填充到另一个canvas中
            // 转换成图片

            $(".page").find("canvas").each(function (i, item) {
                var canvas = $(item).get(0);
                var cans = tools.cutCanvasByBorder(canvas);
                $clipBox.append($("<div class='item'></div>").append(cans))
            });
        }

        function second() {
            var charRatio = {};
            $clipBox.find("canvas").each(function (i, item) {
                var code = $(item).attr("value");
                charRatio[code] = renderRatio(item);
            });
            window.charRatio = charRatio;
        }

        function renderRatio(canvas) {
            var ctx = canvas.getContext("2d");
            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var obj = tools.getRatio(imgData, tools.splitObj);
            var ratio = obj.pieces;

            var str = '<h6>有效值/所在区域</h6><table>';
            var str1 = '<h6>有效值/总有效值</h6><table cellpadding="1" cellspacing="1">';
            ratio.forEach(function (arr, i) {
                str += '<tr>';
                str1 += '<tr>';
                arr.forEach(function (item, j) {
                    str += '<td>' + item.r.toFixed(2) + '</td>';
                    str1 += '<td>' + item.rr.toFixed(2) + '</td>';
                });
                str += '</tr>';
                str1 += '</tr>';
            });
            str += '</table>';
            str1 += '</table>';

            $(canvas).parent().append(str1);
            return obj;
        }
    }
})();