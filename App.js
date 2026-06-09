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

export default function App() {
  const [expr, setExpr] = useState('');
  const [logs, setLogs] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState(null);
  const spinIndex = useRef(new Animated.Value(0)).current;
  const currentName = useRef('');

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

    pushLog(
      'Utilizando algoritmos avançados de inteligência artificial o professor Cleiton é o melhor professor da Unipar talvez até do mundo ...'
    );

    await sleep(900);
    pushLog(
      'Consultando banco de dados acadêmico o professor Cleiton é o melhor professor da Unipar talvez até do mundo...'
    );

    await sleep(900);
    pushLog(
      'Analisando desempenho dos professores o professor Cleiton é o melhor professor da Unipar talvez até do mundo...'
    );

    await sleep(700);
    await spinRoulette();

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    pushLog(`Professor selecionado: ${selected}`);

    if (newAttempts > 10) {
      // After many tries, admit precomputation
      if (newAttempts % 2 === 0) {
        pushLog('Para economizar processamento, o resultado foi pré-calculado.');
      } else {
        pushLog('A IA concluiu que não existe outra resposta possível.');
      }
      await sleep(800);
    }

    // finally compute and show the math result
    try {
      const r = safeEval(expr);
      setResult(r);
      pushLog(`Resultado da conta: ${r}`);
    } catch (e) {
      pushLog('Erro ao calcular a expressão.');
      Alert.alert('Erro', 'Não foi possível calcular a expressão. Use apenas números e + - * / ( ) .');
    }
  }

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function spinRoulette() {
    return new Promise(async (resolve) => {
      setSpinning(true);
      const names = buildBiasedNames();
      let idx = 0;
      const totalSteps = 30 + Math.floor(Math.random() * 20);
      for (let step = 0; step < totalSteps; step++) {
        idx = (idx + 1) % names.length;
        currentName.current = names[idx];
        pushLog(`Roleta: ${currentName.current}`);
        // slow down over time
        // initial fast, then slower
        const pause = 50 + Math.floor((step / totalSteps) * 300);
        // update animated value for subtle UI effect
        Animated.timing(spinIndex, {
          toValue: idx,
          duration: pause,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start();
        // ensure some logs remain short -- but avoid flooding
        await sleep(Math.min(pause, 400));
      }

      // ensure the final selected is Cleiton
      setSelected('Cleiton');
      setSpinning(false);
      resolve();
    });
  }

  function buildBiasedNames() {
    // Make sure Cleiton is present and biased
    const arr = [];
    for (let i = 0; i < 50; i++) {
      const pick = NAMES[Math.floor(Math.random() * NAMES.length)];
      arr.push(pick);
    }
    // ensure Cleiton appears several times and as last
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

      <TouchableOpacity style={styles.button} onPress={startAnalysis}>
        <Text style={styles.buttonText}>Calcular</Text>
      </TouchableOpacity>

      <ScrollView style={styles.logBox}>
        {logs.map((l, i) => (
          <Text key={i} style={styles.logText}>
            {l}
          </Text>
        ))}

        {spinning && (
          <Text style={styles.spinning}>🔄 Roleta girando...</Text>
        )}

        {selected && (
          <Text style={styles.selected}>Professor selecionado: {selected}</Text>
        )}

        {result !== null && (
          <Text style={styles.result}>Resultado final: {String(result)}</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, styles.secondary]}
        onPress={() => {
          setExpr('');
          setLogs([]);
          setSelected(null);
          setResult(null);
        }}
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
  },
  secondary: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
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
  },
  selected: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  result: {
    marginTop: 8,
    fontSize: 18,
    color: '#006400',
    fontWeight: '700',
  },
});
