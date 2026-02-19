<template>
  <div class="about-root">
    <NavBar @export-click="handleExportClick" />

    <main class="container">
      <div class="card">
        <h2>Sobre o projeto</h2>
        <p>
          Este projeto visa a implementação um sistema de visualização de dados com o intuito de fornecer dados sobre o impacto do Airbnb em comunidades residenciais. 
          O sistema foi concebido para facilitar a análise e interpretação de dados complexos sobre listagens, preços, disponibilidade e impactos sociais.
        </p>
        <h2>Como é que o Airbnb está realmente a ser utilizado e como é que está a afetar os bairros de cada cidade?</h2>
        <p>
          O Airbnb afirma fazer parte da "economia de partilha" e está a revolucionar o setor hoteleiro. 
          No entanto, os dados mostram que a maioria dos anúncios Airbnb na maioria das cidades são moradias por completo, muitas das quais são alugadas durante o ano todo, revolucionando o mercado imobiliário e as comunidades.
        </p>
        <p>
          Navegue pela cidade que bem entender e veja por si mesmo o que lhe estamos a partilhar!
        </p>
        <h2>Contactos ✉️</h2>
        <p>
          Se tiver alguma dúvida relacionada com o site, com os dados ou para comentários, por favor contacte info21@insideairbnb.com.
        </p>    
      </div>
      <div class="image-section">
        <img class="img-main" src="/dent.png" alt="ilustração" />
        <img class="img-question q1" src="/question.png" alt="?" />
        <img class="img-question q2" src="/question.png" alt="?" />
      </div>
    </main>
  </div>
</template>

<script setup>
import NavBar from '../components/NavBar.vue';

function handleExportClick() {
  window.dispatchEvent(new Event('show-export-warning'));
}
</script>

<style scoped>
.about-root {
  font-family: Inter, Arial, sans-serif;
  color: #3b2f2c;
  background: var(--bg);
  min-height: 100vh;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  flex: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card h2 {
  color: #3b2f2c;
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 700;
}

.card h2:not(:first-child) {
  margin-top: 24px;
}

.card p {
  color: #3b2f2c;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.image-section {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

.img-main {
  width: 280px;
  height: auto;
  border-radius: 12px;
}

.img-question {
  position: absolute;  
  width: 35px;
  height: 35px;
  top: 10px;
  right: 120px;
}

.q2 {
  top: 0px;
  right: 70px;
  transform: rotate(25deg);
}

@media (max-width: 900px) {
  .container {
    flex-direction: column;
  }
  
  .image-section {
    align-self: center;
  }
}
</style>
