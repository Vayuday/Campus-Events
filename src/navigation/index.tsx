import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet } from "react-native";
import { useAuth } from "../store/auth";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import EventsListScreen from "../screens/EventsListScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import MyTicketsScreen from "../screens/MyTicketsScreen";
import TicketDetailScreen from "../screens/TicketDetailScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { theme } from "../theme";

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function EventsStack() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="EventsList"
        component={EventsListScreen}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: "" }}
      />
    </AppStack.Navigator>
  );
}

function TicketsStack() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="MyTickets"
        component={MyTicketsScreen}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ title: "Ticket" }}
      />
    </AppStack.Navigator>
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text
        style={[
          styles.tabIconText,
          { color: focused ? theme.colors.brand : theme.colors.subtle },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.subtle,
        tabBarStyle: {
          paddingTop: 6,
          paddingBottom: 6,
          height: 62,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="Events"
        component={EventsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Events" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="Tickets"
        component={TicketsStack}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Tickets" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="Inbox"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Inbox" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const user = useAuth((s) => s.user);
  return user ? <MainTabs /> : <AuthFlow />;
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
  tabIconText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
