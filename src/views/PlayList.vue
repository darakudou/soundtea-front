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
      let redirect_uri = process.env.VUE_APP_REDIRECT_URI 
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
      this.tempos = []
      const a =  axios.get(endpoint, data)
      .then(async function(res){
        let labels = []
        let tempos = []
        let datacollection = {labels:[], datasets:[]}
        // ループ文
        for(const item of res.data.items)
       { 
           let endpoint1 = 'https://api.spotify.com/v1/audio-features/' + item.track.id 
           await axios.get(endpoint1, data)
           .then(r =>{
             labels.push(item.track.name)
             tempos.push(r.data.tempo)
           })
        }
        datacollection["labels"] = labels 

        datacollection["datasets"] =  [ 
          {
            label: 'tempo',
            backgroundColor: '#f87979',
            data: tempos
          },
        ]
        return datacollection
      })
      a.then(res =>{
        this.datacollection = res
        this.loaded = true
      })
    },
  }
}
</script>