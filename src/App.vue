<template>
  <div id="app">
    <!-- Unit System Toggle -->
    <div class="unit-toggle">
      <button 
        class="unit-button" 
        :class="{ active: unitSystem === 'metric' }"
        @click="unitSystem = 'metric'"
      >
        Metric
      </button>
      <button 
        class="unit-button" 
        :class="{ active: unitSystem === 'imperial' }"
        @click="unitSystem = 'imperial'"
      >
        Imperial
      </button>
    </div>

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

    <div class="input-section" v-if="selectedMethod === 'AeroPress'">
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

    <div class="results-section" 
      v-if="selectedMethod === 'Chemex' || 
            selectedMethod === 'AeroPress' || 
            selectedMethod === 'Cafetière (French Press)' || 
            selectedMethod === 'Drip Coffee Machine'">
      <h2>Your Coffee Recipe</h2>
      <div class="recipe-details">
        <p>Water needed: {{ formatWater(totalWater) }}</p>
        <p>Coffee grounds needed: {{ formatCoffee(coffeeAmount) }}</p>
        <p class="ratio-text">Using ratio 1:{{ ratio }}</p>

        <!-- Ratio Summary Box -->
        <div class="ratio-summary">
          <h3>1 cup breakdown:</h3>
          <div class="ratio-boxes">
            <div class="ratio-box">
              <h4>Coffee</h4>
              <div class="amount">{{ formatCoffee((cupsSize / ratio).toFixed(1)) }}</div>
              <div class="unit">{{ unitSystem === 'metric' ? 'grams' : 'oz' }}</div>
            </div>
            <div class="ratio-box">
              <h4>Water</h4>
              <div class="amount">{{ formatWater(cupsSize) }}</div>
              <div class="unit">{{ unitSystem === 'metric' ? 'ml' : 'fl oz' }}</div>
            </div>
          </div>
        </div>

        <p v-if="selectedMethod === 'AeroPress'" class="model-text">
          Using {{ selectedAeroPress }} ({{ cupsSize }}ml per cup)
        </p>
        <p v-if="selectedMethod === 'Cafetière (French Press)'" class="brew-note">
          Brew time: 4 minutes before plunging
        </p>

        <!-- Brewing Instructions -->
        <div v-if="selectedMethod === 'Chemex'" class="brewing-instructions">
          <button class="toggle-instructions" @click="showBrewingDetails = !showBrewingDetails">
            {{ showBrewingDetails ? 'Hide' : 'Show' }} Brewing Instructions
          </button>
          <div v-if="showBrewingDetails" class="instructions-content">
            <p class="total-time">Total Time: {{ brewingInstructions.Chemex.time }}</p>
            <div v-for="(step, index) in brewingInstructions.Chemex.steps" 
                 :key="index" 
                 class="instruction-step">
              <h4>{{ step.title }}</h4>
              <p>{{ step.details }}</p>
            </div>
          </div>
        </div>

        <div v-if="selectedMethod === 'AeroPress'" class="brewing-instructions">
          <div class="method-selector">
            <button 
              class="method-button" 
              :class="{ active: aeroPressMethod === 'standard' }"
              @click="aeroPressMethod = 'standard'"
            >
              Standard Method
            </button>
            <button 
              class="method-button" 
              :class="{ active: aeroPressMethod === 'inverted' }"
              @click="aeroPressMethod = 'inverted'"
            >
              Inverted Method
            </button>
          </div>
          <div class="instructions-content">
            <p class="total-time">Total Time: {{ brewingInstructions.AeroPress[aeroPressMethod].time }}</p>
            <div class="instruction-steps">
              <div v-for="(step, index) in brewingInstructions.AeroPress[aeroPressMethod].steps" 
                   :key="index" 
                   class="instruction-step">
                <p>{{ index + 1 }}. {{ step }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedMethod === 'Drip Coffee Machine'" class="brewing-instructions">
          <div class="instructions-content">
            <p class="total-time">Total Time: {{ brewingInstructions['Drip Coffee Machine'].time }}</p>
            <div v-for="(step, index) in brewingInstructions['Drip Coffee Machine'].steps" 
                 :key="index" 
                 class="instruction-step">
              <h4>{{ step.title }}</h4>
              <p>{{ step.details }}</p>
            </div>
            <div class="tips-section">
              <h4>Tips for Best Results:</h4>
              <ul>
                <li v-for="(tip, index) in brewingInstructions['Drip Coffee Machine'].tips" 
                    :key="index">
                  {{ tip }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      coffeeMethods: ['Chemex', 'AeroPress', 'Cafetière (French Press)', 'Drip Coffee Machine'],
      selectedMethod: 'Chemex',
      peopleCount: 1,
      coffeeStrengths: ['Light', 'Medium', 'Strong'],
      selectedStrength: 'Medium',
      ratio: 16,
      isCustomRatio: false,
      cupsSize: 300,
      showBrewingDetails: false,
      aeroPressMethod: 'standard',
      unitSystem: 'metric',
      brewingInstructions: {
        'Chemex': {
          time: '4:00-5:00 minutes total',
          steps: [
            {
              title: 'Bloom phase (30-45 seconds)',
              details: 'Pour about twice the weight of the coffee in water (e.g., for 30g coffee, use ~60g water). Let the coffee bloom to release gases.'
            },
            {
              title: 'First pour (1:30 minutes)',
              details: 'After the bloom, start pouring water in slow, circular motions until half of your total water amount is added.'
            },
            {
              title: 'Second pour (2:00 minutes)',
              details: 'Continue pouring the remaining water, ensuring the coffee bed is consistently wet. Total brew time should reach around 4:00-5:00 minutes.'
            }
          ]
        },
        'AeroPress': {
          standard: {
            time: '1:30-2:00 minutes total',
            steps: [
              'Add coffee and water',
              'Stir for about 10 seconds',
              'Let steep for 1:00 to 1:30 minutes',
              'Press down slowly for about 20-30 seconds'
            ]
          },
          inverted: {
            time: '2:30-3:00 minutes total',
            steps: [
              'Add coffee and water',
              'Stir for 10-15 seconds',
              'Let steep for 2:00 to 2:30 minutes',
              'Flip and press slowly for 20-30 seconds'
            ]
          }
        },
        'Drip Coffee Machine': {
          time: '4-6 minutes total',
          steps: [
            {
              title: 'Prepare the filter',
              details: 'Place a paper filter in the basket. Rinse it with hot water to remove any paper taste and warm the carafe. Discard the rinse water.'
            },
            {
              title: 'Add coffee grounds',
              details: 'Evenly distribute the grounds in the filter.'
            },
            {
              title: 'Fill the water reservoir',
              details: 'Add the measured amount of fresh, filtered water to the reservoir.'
            },
            {
              title: 'Start brewing',
              details: 'Let the machine run its full brewing cycle (4-6 minutes).'
            },
            {
              title: 'Serve immediately',
              details: 'Pour the freshly brewed coffee into your cup and enjoy!'
            }
          ],
          tips: [
            'Use fresh, filtered water for better flavor',
            'Clean your drip machine regularly to avoid buildup that can affect taste',
            'Pre-warm your cup to keep coffee hotter for longer'
          ]
        }
      },
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
        'AeroPress': {
          size: 'Medium-fine (similar to table salt)',
          reason: 'Works well for a balanced flavor and faster extraction. You can adjust finer or coarser depending on brewing time and strength preference.'
        },
        'Cafetière (French Press)': {
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
      if (this.selectedMethod === 'AeroPress') {
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
      } else if (this.selectedMethod === 'Cafetière (French Press)') {
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
      } else if (this.selectedMethod === 'Drip Coffee Machine') {
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
    },
    formatWater(ml) {
      if (this.unitSystem === 'metric') {
        return `${ml}ml`;
      } else {
        // Convert ml to fl oz (1 ml ≈ 0.033814 fl oz)
        const flOz = (ml * 0.033814).toFixed(1);
        return `${flOz}fl oz`;
      }
    },
    formatCoffee(grams) {
      if (this.unitSystem === 'metric') {
        return `${grams}g`;
      } else {
        // Convert grams to ounces (1g ≈ 0.035274 oz)
        const oz = (grams * 0.035274).toFixed(2);
        return `${oz}oz`;
      }
    }
  },
  watch: {
    selectedMethod(newMethod) {
      // Reset cup size and ratios when switching methods
      if (newMethod === 'Chemex') {
        this.cupsSize = 300;
      } else if (newMethod === 'AeroPress') {
        this.cupsSize = 240;
      } else if (newMethod === 'Cafetière (French Press)') {
        this.cupsSize = 350;
      } else if (newMethod === 'Drip Coffee Machine') {
        this.cupsSize = 240; // Standard drip coffee cup size
      }
      this.selectStrength(this.selectedStrength);
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
  position: relative;
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

.brew-note {
  color: #2E7D32;
  font-style: italic;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #e0e0e0;
}

.brewing-instructions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.toggle-instructions {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.toggle-instructions:hover {
  background: #45a049;
}

.instructions-content {
  margin-top: 15px;
  text-align: left;
}

.total-time {
  font-weight: 600;
  color: #2E7D32;
  margin-bottom: 10px;
}

.instruction-step {
  margin-bottom: 15px;
}

.instruction-step h4 {
  color: #2E7D32;
  margin-bottom: 5px;
}

.method-selector {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 15px;
}

.method-button {
  background: #f8f9fa;
  border: 2px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.method-button.active {
  background: #E8F5E9;
  border-color: #4CAF50;
  color: #2E7D32;
  font-weight: 600;
}

.method-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.instruction-steps {
  padding-left: 20px;
}

.tips-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.tips-section h4 {
  color: #2E7D32;
  margin-bottom: 10px;
}

.tips-section ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.tips-section li {
  margin: 8px 0;
  color: #333;
}

.ratio-summary {
  margin: 20px 0;
  padding: 15px;
  background: #f0f4f0;
  border-radius: 8px;
  border: 1px solid #dde3dd;
}

.ratio-summary h3 {
  color: #2E7D32;
  font-size: 16px;
  margin-bottom: 12px;
  text-align: center;
}

.ratio-boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.ratio-box {
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  text-align: center;
}

.ratio-box h4 {
  color: #2E7D32;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.ratio-box .amount {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.ratio-box .unit {
  font-size: 12px;
  color: #666;
}

.unit-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 5px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid #dde3dd;
}

.unit-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.unit-button:hover {
  background: #e9ecef;
}

.unit-button.active {
  background: #4CAF50;
  color: white;
}
</style> 