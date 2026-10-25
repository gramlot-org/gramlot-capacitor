"""Native screen orientation and opt-in motion measurements through Data."""
from mobile_application.page import DevicePage


class Page(DevicePage):
    title = 'Orientation and sensors'

    def example(self, page):
        orientation = page.section(class_='device-card')
        orientation.h2('Screen orientation')
        orientation.p('Rotate the screen to switch between portrait and landscape. The iOS rotation lock keeps the screen orientation unchanged.')
        self.state(orientation, 'orientation')
        self.fields(orientation, 'orientation', ('type', 'direction', 'timestamp'))
        for name, title, unit in (('gyroscope', 'Gyroscope', 'rad/s'), ('accelerometer', 'Accelerometer', 'g, including gravity')):
            card = page.section(class_='device-card')
            card.h2(title)
            card.p(f'Device-fixed axes; measurements in {unit}. Updates approximately every 100 ms.')
            card.checkbox(value=f'^gramlot.device.{name}?enabled', mode='switch', label='Enable sensor')
            card.span('Watching: ')
            card.span(f'^gramlot.device.{name}?watching')
            self.state(card, name)
            self.fields(card, name, ('x', 'y', 'z', 'timestamp'))
        page.p('Sensors stop on the Home Screen and resume on return if enabled. Closing the page releases them. Measurements stay local.')
