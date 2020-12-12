<template>
  <div class="playList">
    <h1>PlayList</h1>
    <v-btn v-on:click="spotifyLogin">認証</v-btn>
    <v-btn v-on:click="getPlayLists">プレイリストの取得</v-btn>
    <v-select
          :items="playLists"
          v-model="name"
          label="play list"
          item-text="name"
          item-value="id"
          return-object
          dense
          @input="getTracks"
        ></v-select>
    <div class="small">
      <chart v-if="loaded" :chartData="datacollection"
                           :options="chartOptions"
                           :height=100
                           :weight=200
                           ></chart>
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
        datacollection: {labels:[], datasets:[]},
        chartOptions: null,
        playLists: [],
        value: null,
        name: null,
        tracks: null,
        track: null,
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
    getTracks: function(selected){
      // https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlists-tracks/
      let endpoint = 'https://api.spotify.com/v1/playlists/' +  selected.id + '/tracks'
      let data = {
        headers: {
          'Authorization': this.routeParams.token_type + ' ' + this.routeParams.access_token
        },
        data: {}
      }
      this.labels = []
      this.tempos = []
      axios.get(endpoint, data)
      .then(res =>{
        for(const item of res.data.items)
        {
        this.getTrack(item.track.name, item.track.id)
        .then(r =>{
          this.labels.push(item.track.name)
          this.tempos.push(r.tempo)
          })
          }
        /*
        res.data.items.forEach(item =>{
        this.getTrack(item.track.name, item.track.id)
        .then(r =>{
          this.labels.push(item.track.name)
          this.tempos.push(r.tempo)
          })
          })
          */
          }

      )
      // ここでrenderChartする
      this.datacollection["labels"] = this.labels 
      this.datacollection["datasets"] =  [ 
          {
            label: 'tempo',
            backgroundColor: '#f87979',
            data: this.tempos
          },
      ]
      this.loaded = true
      },
    // https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/
    async getTrack(title, trackId) {
      let endpoint = 'https://api.spotify.com/v1/audio-features/' +  trackId 
      let headers = {
          'Authorization': this.routeParams.token_type + ' ' + this.routeParams.access_token
        }
      console.log("前:" + title)
      const res = await axios.get(endpoint, {headers:headers})
      const result = res.data
      console.log(result)
      console.log("後:" + title)
      return result 
    }
    }
}
</script>