<template>
  <div class="playList">
    <h1>PlayList</h1>
    <button @click="spotifyLogin">認証</button>
    <button @click="getPlayLists">プレイリストの取得</button>
    <!-- 取得したプレイリストはselect boxに溜め込みたい-->
    <!-- プレイリストで各楽曲取得APIを叩いて取得した情報をchart.jsで表示する-->
    <select  @change="getTracks()" v-model="name">
    <option disabled value="">-----</option>
    <option v-for="(p, key) in playLists" :key="key">{{ p.name }}</option>
    </select>
    <p>{{ tempos }}</p>
    <p>{{ labels }}</p>
    <div class="small">
      <chart v-if="loaded" :chartData="datacollection" :options="chartOptions"/>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Chart from '@/components/Chart.vue'

export default {
  components: {
    Chart
  },
  data: function() {
    return {
        loaded: false,
        labels: null,
        datacollection: {labels:[], dataset:[]},
        chartOptions: null,
        playLists: null,
        value: null,
        name: null,
        tracks: null,
        track: null,
        trackInfos: null,
        tempos: null
    }
  },
  props: {
    routeParams: Object
  },
  created: function() {
    // 全然分かってない。コピペなので・・・
    if (this.$route.hash) {
      this.$router.push(this.$route.fullPath.replace('#', '?'))
    }
  },
  methods: {
    spotifyLogin: function() {
      let endpoint = 'https://accounts.spotify.com/authorize'
      let response_type = 'token'
      let client_id = process.env.VUE_APP_SPOTIFY_CLIENT_KEY 
      let redirect_uri = 'http://localhost:8080' 
      let scope = 'playlist-read-private'
      location.href = endpoint + 
        '?response_type=' + response_type +
        '&client_id=' + client_id +
        '&redirect_uri=' + redirect_uri +
        '&scope=' + scope
    },
     getPlayLists: function() {
      let endpoint = 'https://api.spotify.com/v1/me/playlists'
      let data = {
        headers: {
          'Authorization': this.routeParams.token_type + ' ' + this.routeParams.access_token
        },
        data: {}
      }
      axios
      .get(endpoint, data)
      .then(res => {
        this.playLists = res.data.items
      })
      .catch(err => {
        console.error(err)
      })
    },
    getTracks: function(){
      let id = null
      this.playLists.forEach(element => {
        if (element.name === this.name)
        {
             id = element.id
        }
      });
      // セレクトしたpllaylistのidを取得出来るか？
      // ここでtrack情報をループで取得する
      // https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlists-tracks/
      let endpoint = 'https://api.spotify.com/v1/playlists/' +  id + '/tracks'
      let data = {
        headers: {
          'Authorization': this.routeParams.token_type + ' ' + this.routeParams.access_token
        },
        data: {}
      }
      axios
      .get(endpoint, data)
      .then(res => {
        // この辺でもう一回APIをループを投げてtrackでapiを投げて結果をリストに保存して、子のcomponent(chart.jsに投げる)
        this.labels = []
        this.tempos = []
        this.trackInfos = []
        res.data.items.forEach(element =>{
          this.getTrack(element.track.name, element.track.id)
        })
        // ここでrenderChartする
        this.datacollection["labals"] = this.labels 
        this.datacollection["dataset"] =  [ 
            {
              label: 'tempo',
              backgroundColor: '#f87979',
              data: this.tempos
            },
        ]
        this.loaded = true
        console.log(this.datacollection)
        console.log(this.datacollection.dataset[0].label)
          }
     )
      .catch(err => {
        console.error(err)
      })
    },
    // https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/
    getTrack: function(title, trackId) {
      let endpoint = 'https://api.spotify.com/v1/audio-features/' +  trackId 
      let data = {
        headers: {
          'Authorization': this.routeParams.token_type + ' ' + this.routeParams.access_token
        },
        data: {}
      }
      axios
      .get(endpoint, data)
      .then(res => {
          // publicな変数?にとりあえず突っ込む
          this.labels.push(title)
          let trackInfo = {title: title}
          trackInfo.info = res.data
          this.trackInfos.push(trackInfo)
          this.tempos.push(res.data.tempo)
       })
    },
  }
}
</script>