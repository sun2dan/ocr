// 字符边界
var boundary = {
    pixInfo: [],

    // 获取四个边界
    getTop: function () {
        var pixInfo = this.pixInfo;
        for (var i = 0, len = pixInfo.length; i < len; i++) {
            var arr = pixInfo[i];
            for (var j = 0, leng = arr.length; j < leng; j++) {
                var obj = arr[j];
                if (this.isValidColor(obj)) {
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
                if (this.isValidColor(obj)) {
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
                if (this.isValidColor(obj)) {
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
                if (this.isValidColor(obj)) {
                    return obj.x;
                }
            }
        }
        return 0;
    },

    // 是否为有效的色值
    isValidColor: function (obj) {
        var flag = obj.r === 255 && obj.g === 255 && obj.b === 255;
        return !flag;
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
        this.pixInfo = pixInfo;
    },

    // 入口
    init: function (imageData) {
        var self = this;
        this.formatData(imageData);
        var range = {
            t: self.getTop(),
            r: self.getRight(),
            b: self.getBottom(),
            l: self.getLeft()
        };
        range.w = range.r + 1 - range.l;
        range.h = range.b + 1 - range.t;
        console.log(range);
        return range;
    }
};