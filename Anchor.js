import Sprite from "./Sprite.js";
import Vec2 from "./Vec2.js";


class Anchor {
    constructor(type, number) {
        this.sp = new Sprite("src/anchor_" + type + ".png");

        this.number = number;
        this.outstr = "";
        if (this.number < 10) {
            this.outstr = "00" + this.number;
        } else if (this.number < 100) {
            this.outstr = "0" + this.number;
        } else {
            this.outstr = this.number;
        }


        this.pos = new Vec2();

        this.orgPos = new Vec2();
    }

    z_order = 0;

    scale = 1.0;

    visit(canvas, height) {
        this.sp.pos.set_p(this.pos);
        this.sp.scale = this.scale;

        this.sp.visit(canvas, height);

        canvas.save();

        var x = this.pos.x;
        var y = this.pos.y;

        canvas.translate(x, y);

        canvas.scale(this.scale, this.scale);

        canvas.font = "80px Verdana";

        canvas.fillText(this.outstr, 20, 140);


        canvas.restore();



    }
}

var anchorData = new Array();
for (var i = 1; i <= 199; ++i) {
    anchorData[i] = new Object();
    anchorData[i].type = 1;
    anchorData[i].x = 0;
    anchorData[i].y = 0;
}

anchorData[1] = { type: 3, x: 1430, y: 338};
anchorData[2] = { type: 1, x: 3410, y: 175};
anchorData[3] = { type: 2, x: 4679, y: 195};
anchorData[4] = { type: 1, x: 5470, y: 132};
anchorData[5] = { type: 1, x: 8548, y: 213};
anchorData[6] = { type: 1, x: 9517, y: 209};
anchorData[7] = { type: 2, x: 10445, y: 272};

anchorData[8] = { type: 1, x: 983, y: 794};
anchorData[9] = { type: 1, x: 1792, y: 806};
anchorData[10] = { type: 1, x: 4057, y: 740};
anchorData[11] = { type: 1, x: 4652, y: 843};
anchorData[12] = { type: 1, x: 5163, y: 739};
anchorData[13] = { type: 3, x: 6025, y: 703};
anchorData[14] = { type: 2, x: 6943, y: 511};
anchorData[15] = { type: 2, x: 7866, y: 427};
anchorData[16] = { type: 1, x: 8756, y: 747};
anchorData[17] = { type: 1, x: 10410, y: 1011};
anchorData[18] = { type: 1, x: 550, y: 1153};
anchorData[19] = { type: 1, x: 1310, y: 1231};
anchorData[20] = { type: 1, x: 2219, y: 1001};
anchorData[21] = { type: 1, x: 3178, y: 1386};
anchorData[22] = { type: 2, x: 4696, y: 1521};
anchorData[23] = { type: 2, x: 5422, y: 1131};
anchorData[24] = { type: 1, x: 6566, y: 1173};
anchorData[25] = { type: 1, x: 7061, y: 1298};
anchorData[26] = { type: 1, x: 7759, y: 726};
anchorData[27] = { type: 1, x: 7930, y: 1167};
anchorData[28] = { type: 1, x: 8266, y: 1003};
anchorData[29] = { type: 2, x: 9533, y: 1248};
anchorData[30] = { type: 1, x: 10743, y: 1171};
anchorData[31] = { type: 1, x: 878, y: 1490};
anchorData[32] = { type: 1, x: 1954, y: 1742};
anchorData[33] = { type: 1, x: 2758, y: 1599};
anchorData[34] = { type: 2, x: 4132, y: 1744};
anchorData[35] = { type: 1, x: 4933, y: 1930};
anchorData[36] = { type: 1, x: 5260, y: 1984};
anchorData[37] = { type: 1, x: 5735, y: 1550};
anchorData[38] = { type: 1, x: 6804, y: 1581};
anchorData[39] = { type: 1, x: 7293, y: 1496};
anchorData[40] = { type: 1, x: 8145, y: 1846};
anchorData[41] = { type: 2, x: 8505, y: 1685};
anchorData[42] = { type: 2, x: 10464, y: 1668};
anchorData[43] = { type: 1, x: 356, y: 1894};
anchorData[44] = { type: 1, x: 1428, y: 2103};
anchorData[45] = { type: 1, x: 2236, y: 2232};
anchorData[46] = { type: 3, x: 2900, y: 2035};
anchorData[47] = { type: 1, x: 3423, y: 1897};
anchorData[48] = { type: 1, x: 4282, y: 2279};
anchorData[49] = { type: 1, x: 5543, y: 2292};
anchorData[50] = { type: 1, x: 6054, y: 1959};
anchorData[51] = { type: 1, x: 7110, y: 2057};
anchorData[52] = { type: 2, x: 7648, y: 1911};
anchorData[53] = { type: 1, x: 8242, y: 2242};
anchorData[54] = { type: 1, x: 8643, y: 2100};
anchorData[55] = { type: 2, x: 9597, y: 2074};
anchorData[56] = { type: 1, x: 10839, y: 2169};
anchorData[57] = { type: 1, x: 701, y: 2310};
anchorData[58] = { type: 2, x: 1757, y: 2431};
anchorData[59] = { type: 1, x: 1956, y: 2673};
anchorData[60] = { type: 1, x: 2373, y: 2608};
anchorData[61] = { type: 1, x: 3094, y: 2711};
anchorData[62] = { type: 1, x: 3462, y: 2590};
anchorData[63] = { type: 2, x: 4373, y: 3034};
anchorData[64] = { type: 1, x: 4923, y: 2935};
anchorData[65] = { type: 2, x: 5490, y: 2817};
anchorData[66] = { type: 1, x: 5828, y: 2736};
anchorData[67] = { type: 3, x: 6453, y: 2625};
anchorData[68] = { type: 1, x: 7193, y: 2475};
anchorData[69] = { type: 1, x: 7867, y: 2411};
anchorData[70] = { type: 1, x: 8695, y: 2538};
anchorData[71] = { type: 1, x: 9476, y: 2535};

anchorData[72] = { type: 2, x: 10271, y: 2618};
anchorData[73] = { type: 1, x: 696, y: 2740};
anchorData[74] = { type: 3, x: 1054, y: 3164};
anchorData[75] = { type: 1, x: 1583, y: 3010};
anchorData[76] = { type: 1, x: 2249, y: 3001};
anchorData[77] = { type: 2, x: 2688, y: 3371};
anchorData[78] = { type: 2, x: 3258, y: 3268};
anchorData[79] = { type: 3, x: 3655, y: 3195};
anchorData[80] = { type: 1, x: 4532, y: 3367};
anchorData[81] = { type: 1, x: 5317, y: 3481};
anchorData[82] = { type: 2, x: 5623, y: 3298};
anchorData[83] = { type: 1, x: 6326, y: 3161};
anchorData[84] = { type: 1, x: 6823, y: 2944};
anchorData[85] = { type: 1, x: 7234, y: 2798};
anchorData[86] = { type: 2, x: 7989, y: 3064};
anchorData[87] = { type: 2, x: 8764, y: 3265};
anchorData[88] = { type: 1, x: 9140, y: 3318};
anchorData[89] = { type: 3, x: 9443, y: 3064};
anchorData[90] = { type: 1, x: 9975, y: 3071};
anchorData[91] = { type: 1, x: 10752, y: 3084};
anchorData[92] = { type: 1, x: 398, y: 3565};
anchorData[93] = { type: 3, x: 441, y: 3852};
anchorData[94] = { type: 2, x: 1113, y: 3717};
anchorData[95] = { type: 1, x: 1464, y: 3642};
anchorData[96] = { type: 1, x: 3102, y: 3819};
anchorData[97] = { type: 1, x: 3388, y: 3750};
anchorData[98] = { type: 1, x: 3849, y: 3588};
anchorData[99] = { type: 1, x: 4308, y: 3646};
anchorData[100] = { type: 2, x: 5053, y: 3885};
anchorData[101] = { type: 1, x: 5785, y: 3605};
anchorData[102] = { type: 2, x: 6744, y: 3225};
anchorData[103] = { type: 1, x: 7357, y: 3122};
anchorData[104] = { type: 1, x: 8006, y: 3422};
anchorData[105] = { type: 2, x: 9766, y: 3543};
anchorData[106] = { type: 1, x: 10442, y: 3642};
anchorData[107] = { type: 2, x: 10935, y: 3650};
anchorData[108] = { type: 2, x: 9612, y: 4316};
anchorData[109] = { type: 1, x: 3571, y: 4422};
anchorData[110] = { type: 1, x: 4106, y: 3909};
anchorData[111] = { type: 3, x: 4431, y: 4275};
anchorData[112] = { type: 1, x: 4622, y: 4149};
anchorData[113] = { type: 1, x: 5362, y: 4191};
anchorData[114] = { type: 1, x: 5886, y: 3991};
anchorData[115] = { type: 1, x: 6746, y: 3729};
anchorData[116] = { type: 2, x: 8023, y: 4178};
anchorData[117] = { type: 1, x: 8920, y: 4507};
anchorData[118] = { type: 1, x: 8043, y: 4701};
anchorData[119] = { type: 1, x: 10755, y: 4853};
anchorData[120] = { type: 1, x: 330, y: 5228};
anchorData[121] = { type: 1, x: 720, y: 5250};
anchorData[122] = { type: 2, x: 1270, y: 5210};
anchorData[123] = { type: 2, x: 2661, y: 5170};
anchorData[124] = { type: 2, x: 3448, y: 4977};
anchorData[125] = { type: 1, x: 4888, y: 4528};
anchorData[126] = { type: 1, x: 6274, y: 4288};
anchorData[127] = { type: 2, x: 7291, y: 4516};
anchorData[128] = { type: 3, x: 8604, y: 6027};
anchorData[129] = { type: 1, x: 8865, y: 4814};
anchorData[130] = { type: 1, x: 4637, y: 5060};
anchorData[131] = { type: 1, x: 5063, y: 4749};
anchorData[132] = { type: 1, x: 5928, y: 4727};
anchorData[133] = { type: 2, x: 6885, y: 5187};
anchorData[134] = { type: 1, x: 7577, y: 4954};
anchorData[135] = { type: 2, x: 9210, y: 5105};
anchorData[136] = { type: 1, x: 10514, y: 5609};
anchorData[137] = { type: 1, x: 2177, y: 5640};
anchorData[138] = { type: 1, x: 3697, y: 5320};
anchorData[139] = { type: 1, x: 4597, y: 5366};
anchorData[140] = { type: 3, x: 5919, y: 5260};
anchorData[141] = { type: 1, x: 7148, y: 5352};
anchorData[142] = { type: 2, x: 8071, y: 5537};
anchorData[143] = { type: 1, x: 8891, y: 5414};
anchorData[144] = { type: 2, x: 443, y: 6217};
anchorData[145] = { type: 1, x: 834, y: 6177};
anchorData[146] = { type: 1, x: 1379, y: 6132};
anchorData[147] = { type: 1, x: 1772, y: 6035};
anchorData[148] = { type: 1, x: 2341, y: 5939};
anchorData[149] = { type: 1, x: 2808, y: 5868};
anchorData[150] = { type: 1, x: 3341, y: 5655};
anchorData[151] = { type: 1, x: 3601, y: 5948};
anchorData[152] = { type: 1, x: 3981, y: 5666};
anchorData[153] = { type: 3, x: 4185, y: 5977};
anchorData[154] = { type: 2, x: 5117, y: 5766};
anchorData[155] = { type: 1, x: 5428, y: 6175};
anchorData[156] = { type: 2, x: 6054, y: 6168};
anchorData[157] = { type: 2, x: 6592, y: 6219};
anchorData[158] = { type: 1, x: 7452, y: 5837};
anchorData[159] = { type: 1, x: 7521, y: 7075};
anchorData[160] = { type: 1, x: 9285, y: 6177};
anchorData[161] = { type: 2, x: 10007, y: 6097};
anchorData[162] = { type: 1, x: 11047, y: 6112};
anchorData[163] = { type: 3, x: 1310, y: 6420};
anchorData[164] = { type: 1, x: 1877, y: 6417};
anchorData[165] = { type: 2, x: 2942, y: 6582};
anchorData[166] = { type: 1, x: 4040, y: 6327};
anchorData[167] = { type: 1, x: 4887, y: 6490};
anchorData[168] = { type: 1, x: 5195, y: 6710};
anchorData[169] = { type: 1, x: 6028, y: 6604};
anchorData[170] = { type: 1, x: 6516, y: 6671};
anchorData[171] = { type: 1, x: 9851, y: 7867};
anchorData[172] = { type: 1, x: 8338, y: 6623};
anchorData[173] = { type: 1, x: 9490, y: 6980};
anchorData[174] = { type: 1, x: 10432, y: 6683};
anchorData[175] = { type: 1, x: 10962, y: 7090};
anchorData[176] = { type: 2, x: 247, y: 6988};
anchorData[177] = { type: 1, x: 716, y: 6881};
anchorData[178] = { type: 1, x: 1545, y: 6808};
anchorData[179] = { type: 1, x: 2516, y: 6899};
anchorData[180] = { type: 2, x: 3120, y: 7028};
anchorData[181] = { type: 1, x: 3758, y: 6839};
anchorData[182] = { type: 1, x: 4056, y: 6924};
anchorData[183] = { type: 1, x: 4636, y: 6659};
anchorData[184] = { type: 2, x: 5720, y: 7099};
anchorData[185] = { type: 3, x: 6347, y: 7561};
anchorData[186] = { type: 1, x: 7040, y: 7395};
anchorData[187] = { type: 2, x: 8065, y: 7144};
anchorData[188] = { type: 1, x: 9080, y: 7157};
anchorData[189] = { type: 1, x: 710, y: 7651};
anchorData[190] = { type: 2, x: 1195, y: 7951};
anchorData[191] = { type: 2, x: 1868, y: 7406};
anchorData[192] = { type: 1, x: 2008, y: 8096};
anchorData[193] = { type: 1, x: 3553, y: 7446};
anchorData[194] = { type: 1, x: 3735, y: 7674};
anchorData[195] = { type: 1, x: 4203, y: 7641};
anchorData[196] = { type: 1, x: 4873, y: 7261};
anchorData[197] = { type: 1, x: 4965, y: 7736};
anchorData[198] = { type: 1, x: 7525, y: 8131};
anchorData[199] = { type: 2, x: 9230, y: 8051};

export var anchorData;
export default Anchor;