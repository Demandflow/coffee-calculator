<template>
  <div id="app">
    <h1>Coffee Calculator</h1>
    
    <div class="method-container">
      <div
        v-for="method in coffeeMethods"
        :key="method"
        class="method-box"
        :class="{ active: selectedMethod === method }"
        @click="selectedMethod = method"
      >
        {{ method }}
      </div>
    </div>

    <!-- Grind Size Recommendation -->
    <div class="grind-recommendation" v-if="selectedMethod">
      <div class="grind-info">
        <span class="grind-label">Recommended Grind Size:</span>
        <span class="grind-size">{{ grindSize }}</span>
        <div class="tooltip-container">
          <span class="info-icon">ⓘ</span>
          <div class="tooltip">{{ grindReason }}</div>
        </div>
      </div>
    </div>

    <div class="input-section" v-if="selectedMethod === 'Aero Press'">
      <label>Which AeroPress model do you have?</label>
      <div class="aeropress-options">
        <div
          v-for="model in aeroPressModels"
          :key="model.name"
          class="aeropress-box"
          :class="{ active: selectedAeroPress === model.name }"
          @click="selectAeroPress(model)"
        >
          {{ model.name }}
        </div>
      </div>
    </div>

    <div class="input-section">
      <label for="people-count">How many people are you making coffee for?</label>
      <input 
        type="number" 
        id="people-count" 
        v-model="peopleCount" 
        min="1" 
        max="12"
      >
    </div>

    <div class="strength-section">
      <label>How strong do you like your coffee?</label>
      <div class="strength-options">
        <div
          v-for="strength in coffeeStrengths"
          :key="strength"
          class="strength-box"
          :class="{ active: selectedStrength === strength && !isCustomRatio }"
          @click="selectStrength(strength)"
        >
          {{ strength }}
        </div>
      </div>
    </div>

    <div class="ratio-section">
      <label>Coffee to Water Ratio (1:{{ ratio }})</label>
      <div class="ratio-input">
        <span>1:</span>
        <input 
          type="number" 
          v-model="ratio" 
          min="10" 
          max="20" 
          step="0.5"
          @input="handleRatioChange"
        >
      </div>
    </div>

    <div class="results-section" v-if="selectedMethod === 'Chemex' || selectedMethod === 'Aero Press'">
      <h2>Your Coffee Recipe</h2>
      <div class="recipe-details">
        <p>Water needed: {{ totalWater }}ml</p>
        <p>Coffee grounds needed: {{ coffeeAmount }}g</p>
        <p class="ratio-text">Using ratio 1:{{ ratio }}</p>
        <p v-if="selectedMethod === 'Aero Press'" class="model-text">
          Using {{ selectedAeroPress }} ({{ cupsSize }}ml per cup)
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      coffeeMethods: ['Chemex', 'Aero Press', 'Cafitere', 'Drip Coffee Machine'],
      selectedMethod: 'Chemex',
      peopleCount: 1,
      coffeeStrengths: ['Light', 'Medium', 'Strong'],
      selectedStrength: 'Medium',
      ratio: 16,
      isCustomRatio: false,
      cupsSize: 300, // default for Chemex
      aeroPressModels: [
        { name: 'AeroPress Premium', size: 240 },
        { name: 'AeroPress Original', size: 240 },
        { name: 'AeroPress Clear and colours', size: 240 },
        { name: 'AeroPress XL', size: 500 },
        { name: 'AeroPress Go Travel', size: 240 }
      ],
      selectedAeroPress: 'AeroPress Original',
      grindRecommendations: {
        'Chemex': {
          size: 'Medium-coarse (similar to sea salt)',
          reason: 'Allows for a slower extraction and prevents over-extraction due to the thick Chemex filter.'
        },
        'Aero Press': {
          size: 'Medium-fine (similar to table salt)',
          reason: 'Works well for a balanced flavor and faster extraction. You can adjust finer or coarser depending on brewing time and strength preference.'
        },
        'Cafitere': {
          size: 'Coarse (similar to breadcrumbs)',
          reason: 'Prevents coffee particles from passing through the metal filter and avoids a gritty brew.'
        },
        'Drip Coffee Machine': {
          size: 'Medium (similar to sand)',
          reason: 'Provides optimal extraction for automatic drip brewing methods.'
        }
      }
    };
  },
  computed: {
    totalWater() {
      return this.peopleCount * this.cupsSize;
    },
    coffeeAmount() {
      return (this.totalWater / this.ratio).toFixed(1);
    },
    grindSize() {
      return this.grindRecommendations[this.selectedMethod]?.size || '';
    },
    grindReason() {
      return this.grindRecommendations[this.selectedMethod]?.reason || '';
    }
  },
  methods: {
    selectStrength(strength) {
      this.selectedStrength = strength;
      this.isCustomRatio = false;
      
      // Set ratio based on strength and method
      if (this.selectedMethod === 'Aero Press') {
        switch(strength) {
          case 'Light':
            this.ratio = 17;
            break;
          case 'Medium':
            this.ratio = 15;
            break;
          case 'Strong':
            this.ratio = 12;
            break;
        }
      } else if (this.selectedMethod === 'Chemex') {
        switch(strength) {
          case 'Light':
            this.ratio = 17;
            break;
          case 'Medium':
            this.ratio = 16;
            break;
          case 'Strong':
            this.ratio = 15;
            break;
        }
      }
    },
    selectAeroPress(model) {
      this.selectedAeroPress = model.name;
      this.cupsSize = model.size;
    },
    handleRatioChange() {
      this.isCustomRatio = true;
      this.selectedStrength = 'Custom';
    }
  },
  watch: {
    selectedMethod(newMethod) {
      // Reset cup size and ratios when switching methods
      if (newMethod === 'Chemex') {
        this.cupsSize = 300;
      } else if (newMethod === 'Aero Press') {
        this.cupsSize = 240; // Default AeroPress size
      }
      this.selectStrength(this.selectedStrength); // Reset ratio based on new method
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin: 0 auto;
  max-width: 1200px;
  padding: 20px;
}

.method-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 30px 0;
}

.method-box {
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.method-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.method-box.active {
  border-color: #4CAF50;
  background: #E8F5E9;
  color: #2E7D32;
  font-weight: bold;
}

.input-section {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.strength-section {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.strength-options {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.strength-box {
  padding: 12px 24px;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-width: 100px;
}

.strength-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.strength-box.active {
  border-color: #4CAF50;
  background: #E8F5E9;
  color: #2E7D32;
  font-weight: bold;
}

input[type="number"] {
  padding: 8px 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  width: 80px;
  text-align: center;
}

input[type="number"]:focus {
  outline: none;
  border-color: #4CAF50;
}

label {
  font-size: 18px;
  color: #333;
}

.ratio-section {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.ratio-input {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.ratio-input input {
  width: 60px;
  padding: 8px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.results-section {
  margin-top: 40px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.recipe-details {
  text-align: left;
  margin-top: 15px;
}

.recipe-details p {
  margin: 10px 0;
  font-size: 16px;
}

.ratio-text {
  color: #666;
  font-style: italic;
}

h2 {
  color: #2E7D32;
  margin-bottom: 15px;
}

.aeropress-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  width: 100%;
  max-width: 800px;
  margin-top: 10px;
}

.aeropress-box {
  padding: 15px 20px;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.aeropress-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.aeropress-box.active {
  border-color: #4CAF50;
  background: #E8F5E9;
  color: #2E7D32;
  font-weight: bold;
}

.model-text {
  color: #2E7D32;
  font-weight: 500;
}

.grind-recommendation {
  margin: 20px auto;
  padding: 15px;
  max-width: 600px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.grind-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.grind-label {
  font-weight: 600;
  color: #2E7D32;
}

.grind-size {
  color: #333;
}

.tooltip-container {
  position: relative;
  display: inline-block;
}

.info-icon {
  cursor: pointer;
  color: #4CAF50;
  font-size: 18px;
}

.tooltip {
  visibility: hidden;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  text-align: center;
  padding: 10px;
  border-radius: 6px;
  width: 250px;
  font-size: 14px;
  line-height: 1.4;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
</style> 