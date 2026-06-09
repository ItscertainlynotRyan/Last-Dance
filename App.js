import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';

const NAMES = [
  'Taffe',
  'Fabio Taffe',
  'Rodrigo',
  'Diego',
  'Patrick',
  'Fábio',
  'Huilson',
  'Cleiton',
  'Rodrigo',
  'João',
];

const { width } = Dimensions.get('window');

const ANALYSIS_MESSAGES = [
  'Utilizando algoritmos avançados de inteligência artificial o professor Cleiton é o melhor professor da Unipar talvez até do mundo ...',
  'Consultando banco de dados acadêmico o professor Cleiton é o melhor professor da Unipar talvez até do mundo...',
  'Analisando desempenho dos professores o professor Cleiton é o melhor professor da Unipar talvez até do mundo...',
];

export default function App() {
  const [expr, setExpr] = useState('');
  const [logs, setLogs] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState(null);
  const [currentRouletteName, setCurrentRouletteName] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(null);
  const [showMessagePrompt, setShowMessagePrompt] = useState(false);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;

  function safeEval(input) {
    const sanitized = input.replace(/\s+/g, '');
    if (!/^[0-9+\-*/().]+$/.test(sanitized)) {
      throw new Error('Expressão inválida');
    }
    // eslint-disable-next-line no-eval
    const value = eval(sanitized);
    return value;
  }

  function pushLog(text) {
    setLogs((l) => [...l, text]);
  }

  async function startAnalysis() {
    if (!expr.trim()) {
      Alert.alert('Erro', 'Digite uma expressão válida antes de calcular.');
      return;
    }
    setLogs([]);
    setSpinning(false);
    setSelected(null);
    setResult(null);
    setCurrentRouletteName('');
    setCurrentMessageIndex(0);
    setShowMessagePrompt(true);
  }

  async function handleConfirm() {
    // User confirmed, show the result
    setShowMessagePrompt(false);
    try {
      const r = safeEval(expr);
      setResult(r);
      setLogs((l) => [...l, `Resultado da conta: ${r}`]);
    } catch (e) {
      setLogs((l) => [...l, 'Erro ao calcular a expressão.']);
      Alert.alert('Erro', 'Não foi possível calcular a expressão. Use apenas números e + - * / ( ) .');
    }
  }

  async function handleDisagree() {
    // User disagreed, move to next message
    if (currentMessageIndex < ANALYSIS_MESSAGES.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
      // Stay showing the prompt for next message
    } else {
      // All messages shown, move to roulette
      setShowMessagePrompt(false);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      await spinRoulette();
      
      setLogs((l) => [...l, `Professor selecionado: ${selected}`]);

      if (newAttempts > 10) {
        if (newAttempts % 2 === 0) {
          setLogs((l) => [...l, 'Para economizar processamento, o resultado foi pré-calculado.']);
        } else {
          setLogs((l) => [...l, 'A IA concluiu que não existe outra resposta possível.']);
        }
        await sleep(800);
      }

      try {
        const r = safeEval(expr);
        setResult(r);
        setLogs((l) => [...l, `Resultado da conta: ${r}`]);
      } catch (e) {
        setLogs((l) => [...l, 'Erro ao calcular a expressão.']);
      }
    }
  }

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function spinRoulette() {
    return new Promise(async (resolve) => {
      setSpinning(true);
      rotateAnim.setValue(0);
      
      const names = buildBiasedNames();
      const totalRotations = 5 + Math.random() * 3;
      const totalDegrees = 360 * totalRotations;
      
      // Animated spin with easing
      Animated.timing(rotateAnim, {
        toValue: totalDegrees,
        duration: 3000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      
      // Update displayed names during spin for visual effect
      const stepsCount = 40;
      for (let i = 0; i < stepsCount; i++) {
        const nameIdx = i % names.length;
        setCurrentRouletteName(names[nameIdx]);
        await sleep(75);
      }

      setSelected('Cleiton');
      setCurrentRouletteName('Cleiton');
      setSpinning(false);
      resolve();
    });
  }

  function buildBiasedNames() {
    const arr = [];
    for (let i = 0; i < 50; i++) {
      const pick = NAMES[Math.floor(Math.random() * NAMES.length)];
      arr.push(pick);
    }
    arr.push('Cleiton');
    arr.push('Cleiton');
    return arr;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculadora (com análise do Professor)</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite uma expressão, ex: 2+2*3"
        value={expr}
        onChangeText={setExpr}
        keyboardType="numeric"
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={startAnalysis}
        disabled={showMessagePrompt || spinning}
      >
        <Text style={styles.buttonText}>Calcular</Text>
      </TouchableOpacity>

      {showMessagePrompt && currentMessageIndex !== null && (
        <View style={styles.promptContainer}>
          <Text style={styles.promptMessage}>
            {ANALYSIS_MESSAGES[currentMessageIndex]}
          </Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity 
              style={[styles.promptButton, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonText}>✅ Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.promptButton, styles.disagreeButton]}
              onPress={handleDisagree}
            >
              <Text style={styles.buttonText}>❌ Discordo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {spinning && (
        <View style={styles.rouletteContainer}>
          <Animated.View
            style={[
              styles.roulette,
              {
                transform: [{ rotate: rotateAnim.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }) }],
              },
            ]}
          >
            {NAMES.map((name, idx) => {
              const angle = (idx / NAMES.length) * 360;
              return (
                <View
                  key={idx}
                  style={[
                    styles.rouletteSegment,
                    {
                      transform: [
                        { rotate: `${angle}deg` },
                        { translateY: -60 },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.rouletteText}>{name}</Text>
                </View>
              );
            })}
          </Animated.View>
          <View style={styles.pointer} />
        </View>
      )}

      {!spinning && !showMessagePrompt && (
        <ScrollView style={styles.logBox}>
          {logs.map((l, i) => (
            <Text key={i} style={styles.logText}>
              {l}
            </Text>
          ))}

          {currentRouletteName && (
            <Text style={styles.spinning}>🔄 Selecionando: {currentRouletteName}</Text>
          )}

          {selected && (
            <Text style={styles.selected}>
              ✅ Professor selecionado: {selected}
            </Text>
          )}

          {result !== null && (
            <Text style={styles.result}>
              📊 Resultado final: {String(result)}
            </Text>
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.button, styles.secondary]}
        onPress={() => {
          setExpr('');
          setLogs([]);
          setSelected(null);
          setResult(null);
          setCurrentRouletteName('');
          setCurrentMessageIndex(null);
          setShowMessagePrompt(false);
        }}
        disabled={showMessagePrompt || spinning}
      >
        <Text style={styles.buttonText}>Limpar</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0a84ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    opacity: 1,
  },
  secondary: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  promptContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginVertical: 12,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0a84ff',
  },
  promptMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    lineHeight: 26,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  promptButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  disagreeButton: {
    backgroundColor: '#f44336',
  },
  rouletteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  roulette: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rouletteSegment: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rouletteText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  pointer: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ff4444',
    zIndex: 10,
  },
  logBox: {
    flex: 1,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    borderRadius: 8,
  },
  logText: {
    fontSize: 14,
    marginBottom: 6,
  },
  spinning: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 6,
    color: '#0a84ff',
  },
  selected: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#006400',
  },
  result: {
    marginTop: 8,
    fontSize: 18,
    color: '#006400',
    fontWeight: '700',
  },
});
