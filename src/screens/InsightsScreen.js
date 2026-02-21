import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'


export default function InsightsScreen() {
    return (

        <SafeAreaView style={styles.safe} edges={['top']}>


            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable hitSlop={8}>
                        <Text style={styles.back}>←</Text>
                    </Pressable>

                    <Pressable style={styles.datePill}>
                        <Text style={styles.calendar}>📅</Text>
                        <Text style={styles.dateText}>Oct 24 - Oct 30</Text>
                        <Text style={styles.chevron}>▾</Text>
                    </Pressable>
                </View>

                <View style={styles.titleRow}>
                    <Text style={styles.title}>Weekly Insights</Text>
                    <View style={styles.insightsIcon}>
                        <Text style={styles.iconText}>📊</Text>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Toggle */}
                    <View style={styles.toggle}>
                        <View style={[styles.toggleItem, styles.toggleActive]}>
                            <Text style={styles.toggleActiveText}>Tasks</Text>
                        </View>
                        <View style={styles.toggleItem}>
                            <Text style={styles.toggleText}>Focus Time</Text>
                        </View>
                    </View>

                    {/* Completion Card */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Completion Rate</Text>

                        <View style={styles.metricRow}>
                            <Text style={styles.metric}>72%</Text>
                            <View style={styles.trend}>
                                <Text style={styles.trendText}>↗ 10%</Text>
                            </View>
                        </View>

                        <Text style={styles.subText}>
                            You finished <Text style={styles.bold}>34</Text> out of{' '}
                            <Text style={styles.bold}>47</Text> tasks this week.
                        </Text>
                    </View>

                    {/* Daily Activity (static bars) */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Daily Activity</Text>
                        <Text style={styles.subLabel}>Tasks completed per day</Text>

                        <View style={styles.chart}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                <View key={i} style={styles.barItem}>
                                    <View
                                        style={[
                                            styles.bar,
                                            i === 1 && styles.barActive,
                                            { height: BAR_HEIGHTS[i] },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.day,
                                            i === 1 && styles.dayActive,
                                        ]}
                                    >
                                        {d}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Highlights */}
                    <Text style={styles.sectionTitle}>Highlights</Text>

                    <InsightCard
                        icon="⚡"
                        title="Most Productive Day"
                        text="You crushed it on Tuesday with 12 completed tasks. That's your best day this month!"
                    />

                    <InsightCard
                        icon="⭐"
                        title="Consistency Streak"
                        text="You've maintained a 5-day streak. Great job keeping the momentum going during the work week."
                    />

                    <InsightCard
                        icon="🛋️"
                        title="Weekend Balance"
                        text="You slowed down on the weekend, completing just 3 tasks. Recharging is just as important!"
                    />
                </ScrollView>
            </View>

        </SafeAreaView>
    )
}

function InsightCard({ icon, title, text }) {
    return (
        <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
                <Text>{icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>{title}</Text>
                <Text style={styles.insightText}>{text}</Text>
            </View>
        </View>
    )
}

const BAR_HEIGHTS = [40, 120, 35, 80, 65, 25, 15]

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flex: 1,
    },

    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    back: {
        fontSize: 22,
        color: '#111827',
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    calendar: { marginRight: 6 },
    chevron: { marginLeft: 6, color: '#9CA3AF' },
    dateText: {
        fontSize: 14,
        color: '#111827',
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',
    },
    insightsIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2563EB20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: 18,
    },

    content: {
        padding: 16,
        paddingBottom: 120,
    },

    toggle: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    toggleItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 10,
    },
    toggleActive: {
        backgroundColor: '#FFFFFF',
    },
    toggleText: {
        color: '#6B7280',
        fontWeight: '500',
    },
    toggleActiveText: {
        color: '#2563EB',
        fontWeight: '600',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 8,
    },
    metric: {
        fontSize: 40,
        fontWeight: '700',
        color: '#111827',
        marginRight: 8,
    },
    trend: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    trendText: {
        fontSize: 12,
        color: '#16A34A',
        fontWeight: '600',
    },
    subText: {
        fontSize: 14,
        color: '#6B7280',
    },
    bold: {
        color: '#111827',
        fontWeight: '600',
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    subLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },

    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 140,
    },
    barItem: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        width: 16,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        marginBottom: 6,
    },
    barActive: {
        backgroundColor: '#2563EB',
    },
    day: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    dayActive: {
        color: '#2563EB',
        fontWeight: '600',
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },

    insightCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
    },
    insightIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    insightTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    insightText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
        lineHeight: 20,
    },
})
