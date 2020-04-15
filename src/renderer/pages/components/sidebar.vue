<template>
    <div class="left-side">
        <div class="tool-bar">
            <el-tooltip class="tooltip" content="新建" placement="bottom">
                <i class="el-icon-document-add" @click="showEdit()"></i>
            </el-tooltip>
            <el-tooltip content="删除" placement="bottom">
                <i class="el-icon-delete" @click="deleteFile"></i>
            </el-tooltip>
            <el-tooltip :content="isStart?'停止代理':'启动代理'" placement="bottom">
                <i :class="{'el-icon-video-pause':isStart, 'el-icon-video-play':!isStart}" @click="()=>STServer()"></i>
            </el-tooltip>
        </div>
        <div class="host-list">
            <div class="item" :class="{'active':curEditIndex===0}"  @click="selectFile(0)"><i class="el-icon-s-tools"></i> System Hosts</div>
            <div class="item" v-for="(file,index) in localFiles" :class="{'active':curEditIndex===index+1}" :key="index" @click="selectFile(index+1)">
                <i class="el-icon-document"></i> 
                <span @dblclick="editInput(index)">{{file.title}}</span>
                <i class="el-icon-edit edit" @click="showEdit(true,index)"></i>
                <el-switch
                    style="margin-left: 20px;"
                    :width="30"
                    :value="file.isActive"
                    @change="(val)=>switchChange(val,index)">
                </el-switch>
            </div>
        </div>

        <EditInfo 
            v-show="editInfo.show"
            :title="editInfo.title"
            :editInfo="editInfo"
            :localFiles="localFiles"
            @confirm="confirm"
            @toggle-status="()=>{this.editInfo.show = false}"
        />
    </div>
</template>

<script>
import { readFile, getLocalFileList , dlFile } from '@script/file.js';
import EasyProxy from '@script/proxyServer/proxy.js';
import { GetSudoPassword, setSystemProxy, port } from '@script/utils.js';
import { MessageBox, Message } from 'element-ui';

import EditInfo from './editInfo.vue';

export default {
    props: ['localFiles','curEditIndex'],
    components: {
        EditInfo
    },
    data () {
        return {
            isStart: false,
            editInfo: {
                show: false,
                isEdit: false,
                index: null,
                title: ''
            },
            hostJson: {},
            nwProxy: null
        }
    },
    created () {
        this.refreshList();
        this.selectFile(0);
        this.nwProxy = new EasyProxy({
            port: port,
            onBeforeRequest: (req)=> {
                let host = this.hostJson[req.host]
                console.log(`经过 ${req.host}`,this.hostJson[req.host]);
                
                if (host) {
                    console.log(`log", ${req.host} + 被代理到： ${host}`);
                    req.needDnsResolve = true;
                    req.host = host;
                }
            },
            onServerError: function(e) {
                console.log("error", "serverError" + e.message);
            },
            onRequestError: function(e) {
                console.log(e.message);
            }
        });
    },
    methods: {

        refreshList () {
            let activeJson = JSON.parse(window.localStorage.getItem('activeJson')) || {};
            let localFiles = getLocalFileList();
            localFiles = localFiles.map((item)=>{
                if (activeJson[item.title]){
                    item.isActive = activeJson[item.title];
                }
                return item;
            });
            this.$emit('set-files',localFiles);
        },

        showEdit (flag,index) {
            this.editInfo = {
                show: true,
                isEdit: flag,
                title:  flag? this.localFiles[index].title : '',
                index: index
            };
        },

        deleteFile(){
            if (this.curEditIndex ===0 ) return;
            let fileName = this.localFiles[this.curEditIndex-1].title;
            let nEditIndex = this.curEditIndex -1;
            this.$emit('set-edit-index',nEditIndex);

            dlFile(fileName)
            this.refreshList();
            this.setActiveJson();
        },
        selectFile (index) {
            this.$emit('set-edit-index',index);
        },
        switchChange(val,index){
            this.localFiles[index].isActive = val;
            this.$emit('set-files',this.localFiles);     

            this.refreshHostJson();
            this.setActiveJson();
        },
        setActiveJson () {
            let activeJson = {};
            this.localFiles.forEach(item=>{
                activeJson[item.title] = item.isActive;
            });
            window.localStorage.setItem('activeJson',JSON.stringify(activeJson));
        },
        refreshHostJson () {
            let hostC = '';
            let hostJson = {};
            this.localFiles.forEach((item,key) => {
                if (item.isActive) {
                    hostC += readFile('local',item.title);
                }
            });
            
            hostC.split('\n').forEach((hosts=>{
                let hostArr = hosts.split(' ');
                let ip = hostArr[0];
                let host = hostArr.slice(1)
                host.forEach((ht)=>{
                    hostJson[ht] = ip;
                })
            }))
            this.hostJson = hostJson;
            
            return hostJson;
        },
        confirm (editInfo) {
            if (typeof editInfo.index === 'number') {
                this.localFiles[editInfo.index].title = editInfo.title;
            }

            if (!editInfo.isEdit) this.refreshList();
            this.editInfo = {
                show: false,
                isEdit: false,
                title: '',
                index: null
            };
        },
        // 开启停止服务
        STServer(){
            setSystemProxy((res)=>{
                this.isStart = !this.isStart;
                if (this.isStart) {
                    this.nwProxy.start();
                    Message({ message: '代理开启成功', type: 'success' });
                } else {
                    Message({ message: '代理已关闭' });
                }
            },!this.isStart);
        }
    }
}
</script>

<style lang="scss">
.left-side {
    flex-basis: 224px;
    height: 100%;
    background: #373d47;
    .tool-bar {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 40px;
        background: #3d3d3d;
        color: #9e9e9e;
        font-size: 20px;
        i {
            padding: 8px;
        }
        i:hover{
            color: rgb(151, 149, 149);
            background: rgb(66, 66, 66);
            border-radius: 50%;
            cursor: pointer;
        }
    }
    .host-list {
        color: #ccc;
        font-size: 12px;
        .item {
            display: flex;
            align-items: center;
            height: 25px;
            padding: 10px 20px;
            cursor: pointer;
            user-select:none;
            &:hover,&.active{
                background: #2d3138;
            }
            

            .edit {
                margin: 0;
                visibility: hidden;
            }
            &:hover{
                .edit{
                    visibility: visible;
                }
            }


            i {
                margin-right: 10px;
            }
            span {
                display: inline-block;
                width: 100px;
                height: 20px;
                line-height: 20px;
            }
            input {
                width: 100px;
                box-sizing: border-box;
                height: 20px;
                border-radius: 5px;
                background: transparent;
                border: 1px solid #aaa;
                outline: none;
                color: #ccc;
            }
        }
    }
}
</style>