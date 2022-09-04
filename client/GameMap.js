import { Sprite } from "./webdraw/Sprite.js";
import { Label } from "./webdraw/Label.js";
import { Node } from "./webdraw/Node.js";
import { Vec2 } from "./webdraw/Vec2.js";
import { Size } from "./webdraw/Size.js";
import { ImagePool } from "./webdraw/ImagePool.js";
import { Director, DirectorManager } from "./webdraw/Director.js";

import { game } from "./Game.js";

import { main_director, mouseDown, touchStartPos, insideCanvas, renderData, convertInCanvas } from "./idx.js";

let mapSpriteData = new Object;
mapSpriteData.touchStartMapPos = Vec2.new();
mapSpriteData.mapPos = Vec2.new();
mapSpriteData.scale = 1.0;

export function initMap() {
    mapSpriteData.mapPos.set_with_pos(-2000, -2000);

    let sp = Sprite.new("src/map.bmp");
    sp.set_position_with_pos(0, 0);
    sp.set_anchor_with_pos(0, 0);
    sp.set_scale(2.5);


    let scale_node = main_director.get_child_with_key("scale_node");
    let render_node = scale_node.get_child_with_key("render_node");
    render_node.add_child_with_key(sp, "game_map");

    let upd_node = Node.new();
    main_director.add_child_with_key(upd_node, "upd_map");

    upd_node.add_schedule(function () {
        mapDataUpdate();
    }, 1 / 60.0, 0);
    //sp.orgscale = 10;
    // mapSpriteData.mapPos.set(-2800, -2800);

    //异步加载高分辨率的大地图
    // imgPool.load("src/map.bmp", function (src) {
    //     let m = sprites_main.get("game_map");
    //     m.img = imgPool.get(src);
    //     sp.orgscale = 2.5;
    // });
}

export function mapUpdateOnWheel(p, k) {
    if (!game.isGameStart()) {
        return;
    }
    const CS = 0.05;

    if (insideCanvas(p)) {
        mapSpriteData.scale += CS * k;

        mapSpriteData.scale = Math.max(0.1, mapSpriteData.scale);
        mapSpriteData.scale = Math.min(2, mapSpriteData.scale);
    }
}

export function updateMapOnMouseDown(p) {
    if (!game.isGameStart()) {
        return;
    }
    mapSpriteData.touchStartMapPos.set_with_other(mapSpriteData.mapPos);
}

function mapDataUpdate() {
    let scale_node = main_director.get_child_with_key("scale_node");
    let render_node = scale_node.get_child_with_key("render_node");

    let game_map = render_node.get_child_with_key("game_map");

    function calcuSpeed(x, a, b) {
        return (x * x) / (b * (x + a));
    }

    //检查拖动
    let size = Size.scalar(game_map.get_size(), game_map.get_scale());
    let w = size.w;
    let h = size.h;
    // //左侧
    // mapSpriteData.mapPos.x = Math.min(mapSpriteData.mapPos.x, renderData.width / 2);
    // //右侧
    // mapSpriteData.mapPos.x = Math.max(mapSpriteData.mapPos.x, -w + renderData.width / 2);
    // //上侧
    // mapSpriteData.mapPos.y = Math.min(mapSpriteData.mapPos.y, renderData.height / 2);
    // //下侧
    // mapSpriteData.mapPos.y = Math.max(mapSpriteData.mapPos.y, -h + renderData.height / 2);

    //计算地图移动
    {
        let nowPos = render_node.get_position();
        let dPos = Vec2.sub(mapSpriteData.mapPos, nowPos);
        let dis = dPos.dist();

        let speed = calcuSpeed(dis, 3, 5);
        let dx = Vec2.add(nowPos, Vec2.scalar(Vec2.normalize(dPos), speed));

        if (speed <= 0.003) {
            dx.set_with_other(Vec2.add(nowPos, dPos));
        }

        render_node.set_position_with_other(dx);
    }

    //检查缩放
    {

        let deltaSc = mapSpriteData.scale - scale_node.get_scale();
        let abs_deltaSc = Math.abs(deltaSc);

        if (abs_deltaSc >= 0.00001) {
            let sp = calcuSpeed(abs_deltaSc * 100, 3, 5) / 100;
            if (abs_deltaSc <= 0.005) {
                mapSpriteData.scale = scale_node.get_scale();
            }

            let flag = deltaSc / abs_deltaSc;
            let tar = scale_node.get_scale() + flag * sp;

            scale_node.set_scale(tar);
        }
    }

    for (let i = 1; i <= 199; ++i) {
        let str = `anchor_${i}`;
        let anc = render_node.get_child_with_key(str);

        let s = scale_node.get_scale();
        if (!anc.mouseon) {
            if (s < 0.4) {
                anc.set_scale(1 + ((0.4 - s) / 0.4) * 1.5);
            } else {
                anc.set_scale(1);
            }
            anc.z_order = 0;
        } else {
            anc.z_order = 1;
        }
    }


    //设置玩家位置
    for (let i = 1; i <= 6; ++i) {
        let k = game.gameData.playerAt[i];

        let anc = render_node.get_child_with_key(`anchor_${k}`);
        let player = render_node.get_child_with_key(`player_${i}`);

        player.set_position_with_other(anc.get_position());

        let s = scale_node.get_scale();
        if (s < 0.4) {
            player.set_scale(3 + ((0.4 - s) / 0.4) * 1.5);
        } else {
            player.set_scale(3);
        }
    }


    //小偷显示的轮
    const thiefShowRound = [3, 8, 13, 18, 24];

    let thief = render_node.get_child_with_key(`player_${1}`);
    //小偷是否显示
    if ((thiefShowRound.includes(game.gameData.gameRound) && game.gameData.chessStepOn >= 2)
        || game.gameData.selfChessCtl.includes(1)) {
        thief.set_visible(true);
    } else {
        thief.set_visible(false);
    }
}

export function convertInMap(p) {
    let scale_node = main_director.get_child_with_key("scale_node");
    let render_node = scale_node.get_child_with_key("render_node");

    //将点击的坐标转换进render_node中的坐标
    let p0 = scale_node.get_position();

    //转换到相同的缩放点
    let p1 = Vec2.sub(p, p0);

    let p2 = Vec2.scalar(p1, 1 / scale_node.get_scale());

    let p3 = Vec2.add(p0, p2);

    let rmap_p = render_node.get_position();

    let map_p = Vec2.add(rmap_p, p0);

    let rp = Vec2.sub(p3, map_p);

    return rp;
}

export function updateMapOnMove(p) {
    if (!game.isGameStart()) {
        return;
    }

    if (mouseDown) {
        if (insideCanvas(p)) {
            let dx = Vec2.sub(touchStartPos, p);
            dx.x = -dx.x;
            dx.y = -dx.y;

            dx.set_with_other(Vec2.scalar(dx, 1 / mapSpriteData.scale));

            dx.add_eq(mapSpriteData.touchStartMapPos);

            mapSpriteData.mapPos.set_with_other(dx);
        }
    }
    //检查鼠标是否在锚点之上
    if (!mouseDown) {
        if (insideCanvas(p)) {
            let conv_p = convertInCanvas(p);

            let rp = convertInMap(conv_p);

            for(let i = 1;i <= 199;++i){
                
            }
        }
    }
}

//地图定位现在的棋子
export function mapLocateNowChessOn() {
    function locate() {
        let p0 = mapSpriteData.mapPos.copy();
        let p1 = players[game.gameData.chessStepOn].pos.copy();

        let p2 = p0.add(p1.negtive());
        p2.x += renderData.width / 2;
        p2.y += renderData.height / 2;
        mapSpriteData.mapPos.set_p(p2);
    }
    //控制的是小偷，那随意定位，如果不是小偷，则不能在小偷不显示的时候定位小偷
    if (game.gameData.selfChessCtl.includes(1)) {
        locate();
    } else {
        //现在不是1号（小偷）下棋,随意定位
        if (game.gameData.chessStepOn != 1) {
            locate();
        }
    }
}
