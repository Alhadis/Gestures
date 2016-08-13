# Main variables
target := index.js
source := lib/gestures.js lib/swipeable.js


all: $(target)

$(target): $(source)
	@cat $^ > $@;
	@echo >> $@; # Blank line
	@$(call exports,Gesture)   >> $@;
	@$(call exports,Swipeable) >> $@;


# Delete generated file
.PHONY: clean
clean:
	rm -f $(target)

define exports
	echo "module.exports.$1 = window.$1;"
endef
