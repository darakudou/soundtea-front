<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: {
    chartdata: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: null
    }
  },
  mounted () {
    console.log("ここ?")
    console.log(this.chartdata)
    this.renderChart(this.chartdata, this.options)
    //let data = {labels:["a", "b", "c"],datasets:[{label:"aa", data:[2,1,3]}]}

  }
}
</script>