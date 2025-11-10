<script>
import { ResultadoJogada } from '@/models/resultadoJogada';
import (ResultadoJogada)
export default {
  props: ['jogadorAJogar', 'vencedor']
  computed:{
    texto(){
      if(this.vencedor == ResultadoJogada.VERMELHO)
        return "Vencedor: Vermelho";
      else if(this.vencedor == ResultadoJogada.AMARELO)
        return "Vencedor: Amarelo";
    }
  } 
}
</script>

<template>

</template>

<style scoped>
.button {
  border: 1px solid black;
  border-radius: 5px;
  text-align: center;
  padding: 10px;
  font-weight: 600;
}
</style>