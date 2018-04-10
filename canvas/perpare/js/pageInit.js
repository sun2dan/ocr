// 页面初始化准备工作
(function () {
    var codes = [[65, 90], [97, 122], [48, 57]];

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
                    var ctx = can.getContext('2d');
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(0, 0, can.width, can.height);
                    ctx.font = 'bold 50px Arial';
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
            var charArr = [[], [], []];
            codes.forEach(function (arr, index) {
                for (var i = arr[0]; i <= arr[1]; i++) {
                    var c = String.fromCharCode(i);
                    charArr[index].push(c);
                }
            });
            this.charArr = charArr;
            //console.log(charArr);
        },
        init: function () {
            this.createCharSet();
            this.createCanvasList();
        }
    };
})();