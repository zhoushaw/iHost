<template>
    <div id="wrapper">
        <div class="left-side">
            <div class="tool-bar">
                <el-tooltip class="tooltip" content="新建" placement="bottom">
                    <i class="el-icon-document-add"></i>
                </el-tooltip>
                <el-tooltip content="删除" placement="bottom">
                    <i class="el-icon-delete"></i>
                </el-tooltip>
                <el-tooltip content="新建" placement="bottom">
                    <i class="el-icon-remove-outline"></i>
                </el-tooltip>
                <el-tooltip content="新建" placement="bottom">
                    <i class="el-icon-circle-check"></i>
                </el-tooltip>
            </div>
            <div class="host-list">
                <div class="item"><i class="el-icon-tickets"></i> System Hosts</div>
                <div class="item" v-for="(item,index) in hostList" :key="index"  @dblclick="editInput(index)">
                    <i class="el-icon-tickets"></i> 
                    <span v-if="!item.isEdit" >{{item.title}}</span>
                    <input 
                        v-else
                        v-model="hostList[index].title" 
                        :ref="`elInput${index}`"
                        size="mini" 
                        @keyup.esc="blurInput(index)"
                        @keyup.enter="blurInput(index)"
                        @blur="blurInput(index)"  />
                </div>
            </div>
        </div>

        <div class="right-side">
            <textarea
                v-model="hostVal"
                class="file-content-textarea"
                @blur="saveFileHandler()"
                @keydown="change"
            ></textarea>
        </div>
    </div>
</template>

<script>
import {localFiles,readFile,redhost,writeHost} from '@script/file.js'
export default {
    name: 'home',
    data () {
        return {
            localFiles,
            hostVal: '',
            curType: '',
            curEditIndex: null,
            hostList: [
                {title: 'My Host',isEdit: false},
                {title: 'Dev',isEdit: false},
                {title: 'Pre',isEdit: false},
            ]
        }
    },
    methods: {
        selectFile () {
            var file = readFile('local','origin');
            this.hostVal = file;
            this.curType = 'local';
        },
        change (e) {
            if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
                this.saveFileHandler();
            }
        },
        editInput (index) {
            this.hostList[index].isEdit = true;
            this.$nextTick(()=>{
                this.$refs[`elInput${index}`][0].focus();
            });
        },
        blurInput (index) {
            this.hostList[index].isEdit = false;
        },
        saveFileHandler() {
            writeHost(this.hostVal);
        }
    }
}
</script>

<style lang="scss">

* {
    margin: 0;
}
html,body { 
    height: 100%;
    width: 100%;
}


#wrapper {
    display: flex;
    justify-content: space-between;
    background:
        radial-gradient(
            ellipse at top left,
            rgba(255, 255, 255, 1) 40%,
            rgba(229, 229, 229, .9) 100%
        );
    height: 100vh;
    width: 100vw;
    .left-side {
        flex-basis: 200px;
        height: 100%;
        background: #212121;
        .tool-bar {
            display: flex;
            justify-content: space-around;
            align-items: center;
            height: 50px;
            background: #0c0c0c;
            color: #9e9e9e;
            font-size: 20px;
            i {
                padding: 8px;
            }
            i:hover{
                color: rgb(194, 190, 190);
                background: rgb(99, 98, 98);
                border-radius: 50%;
                cursor: pointer;
            }
        }
        .host-list {
            color: #ccc;
            font-size: 15px;
            .item {
                display: flex;
                align-items: center;
                height: 40px;
                padding: 10px 20px;
                cursor: pointer;
                user-select:none;
                i {
                    margin-right: 10px;
                }
                input {
                    width: 80px;
                    height: 20px;
                    border-radius: 5px;
                    background: transparent;
                    border: 1px solid #aaa;
                    outline: none;
                    color: #ccc;
                }
            }
            .item:hover{
                background: #2b2a2a;
            }
        }
    }



    .right-side {
        flex-grow: 1;
        background: #404040;
        overflow: hidden;
    }

}



.file-content-textarea {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    outline: none;
    padding: 15px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #ccc;
    background: #404040;
    border: none;
    outline:none;
    resize:none;
}

</style>