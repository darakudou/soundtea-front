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
                           :options="options"
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
        labels: [],
        datacollection: {labels:[], datasets:[]},
        options: null,
        playLists: [],
        value: null,
        name: null,
        tracks: null,
        track: null,
        tempos: [] 
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
      axios.get(endpoint, data)
      .then(async function(res){
        let tempos = []
        let labels = []
        let datacollection = {labels:[], datasets:[]}
        // ループ文
        var promises = [];
        for(const item of res.data.items)
        {
          labels.push(item.track.name)
          let endpoint1 = 'https://api.spotify.com/v1/audio-features/' + item.track.id 
          const a  = axios.get(endpoint1, data)
         promises.push(a) 
        }
        Promise.all(promises)
        .then((values)=> {
          values.forEach(v =>{
            tempos.push(v.data.tempo)
          })
        })
        datacollection["labels"] = labels 

        datacollection["datasets"] =  [ 
          {
            label: 'tempo',
            data: tempos,
            fill: false,
            borderColor: '#dc143c',
            lineTension: 0, // 点と点の繋ぎ方、0で直線になる
          },
        ]
        return datacollection
      })
      .then(res => {
        this.options = {
          'responsive': true ,
          'borderCapStyle': 'round',
        }
        this.datacollection = res 
        this.loaded = true

      })
    },
  }
}
</script>