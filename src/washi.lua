require "files"
require "strings"

function parse_block(text)
    local block = ""
    local check_count = 1
    for i = 1, #text do
        local c = string.sub(text, i, i)
        if c == "}" then
            if check_count <= 1 then
                local lines = split(block, "\n")
                local result = ""
                for k, v in pairs(lines) do
                    result = result .. trim(v) .. "\n"
                end
                return trim(result)
            else
                check_count = check_count - 1
            end
        elseif c == "{" then
            check_count = check_count + 1
        end
        block = block .. c
    end
    return block
end

function get_loop(line)
    local loop = {}
    local is_for_loop = string.match(line, "for[%s]*%(let[%s]+[%g]+[%s]+of[%s]+[%g]+%)[%s]*{")
    if is_for_loop then
        loop.value_key = string.match(line, "for[%s]*%(let[%s]+([%g]+)[%s]+of[%s]+[%g]+%)[%s]*{")
        loop.list_key = string.match(line, "for[%s]*%(let[%s]+[%g]+[%s]+of[%s]+([%g]+)%)[%s]*{")
    end
    return loop
end

function get_if(line)
    local statement = {}
    local is_if_statement = string.match(line, "if[%s]*%(.+%)[%s]*{")
    if is_if_statement then
        statement.value = string.match(line, "if[%s]*%((.+)%)[%s]*{")
    end
    return statement
end

function parse_child_blocks(html)
    local result = {
        parsed_html = "",
        blocks = {}
    }
    local length = 0
    local lines = split(html, "\n")
    local index = 0
    for k, v in pairs(lines) do
        if k > index then
            local loop = get_loop(v)
            local statement = get_if(v)
            if loop.list_key then
                local text = ""
                for i = k + 1, #lines do
                    text = text .. lines[i] .. "\n"
                end
                loop.html = parse_block(text)
                index = k + #split(loop.html, "\n") + 1
                loop.id = random_string(7)
                result.blocks[length + 1] = loop
                length = length + 1
                result.parsed_html = result.parsed_html .. "<div id=\"" .. loop.id .. "\"></div>" .. "\n"
            elseif statement.value then
                local text = ""
                for i = k + 1, #lines do
                    text = text .. lines[i] .. "\n"
                end
                statement.html = parse_block(text)
                index = k + #split(statement.html, "\n") + 1
                statement.id = random_string(7)
                result.blocks[length + 1] = statement
                length = length + 1
                result.parsed_html = result.parsed_html .. "<div id=\"" .. statement.id .. "\"></div>" .. "\n"
            else
                result.parsed_html = result.parsed_html .. v .. "\n"
            end
        end
    end
    return result
end

function parse_html(block, html, root)
    local result = parse_child_blocks(html)
    block.children = result.blocks
    block.parsed_html = result.parsed_html

    for k, v in pairs(block.children) do
        parse_html(v, v.html, root)
    end
end

function get_js_block(block)
    local str = ""
    if block.value then
        str = "{ html: `" .. block.parsed_html .. "`, id: '" .. block.id .. "', condition: '" .. block.value .. "', blocks: [\n"
    elseif block.value_key then
        str = "{ html: `" .. block.parsed_html .. "`, id: '" .. block.id .. "', valueKey: '" .. block.value_key .. "', list: boundValues['" .. block.list_key .. "'], blocks: [\n"
    end

    for k, v in pairs(block.children) do
        str = str .. get_js_block(v)
    end
    str = str .. "] }"

    return str
end

--älskar dig!
local file = 'washi.config'
local lines = lines_from(file)

components = {}

for k, v in pairs(lines) do
    parts = split(v, " ")
    components[k] = { html = parts[1], js = parts[2] }
end

for k, v in pairs(components) do
    local html = read_all(v.html)
    local js_org = read_all(v.js)
    local washi_js = read_all("washi.js")
    local bound_value = read_all("bound_value.js")

    local block = { js = "" }

    parse_html(block, html, block)

    local blockStr = "let blocks = [ "
    for i = 1, #block.children do
        local child = block.children[i]
        block.js = block.js .. "let " .. child.id .. " = \n" .. get_js_block(child) .. ";\n"
        blockStr = blockStr .. child.id .. ", "
    end
    blockStr = blockStr .. " ];"
    block.js = block.js .. blockStr;

    block.js = bound_value .. "\n\n" .. js_org .. "\n\n" .. block.js .. "\n\n" .. washi_js

    if not exists("../build") then
        os.execute('mkdir "../build"')
    end

    local js_file_name = split(v.js, "/")[#split(v.js, "/")]
    local html_file_name = split(v.html, "/")[#split(v.html, "/")]

    local html_file = io.open("../build/" .. html_file_name, "w")
    io.output(html_file)
    io.write(block.parsed_html)

    local js_file = io.open("../build/" .. js_file_name, "w")
    io.output(js_file)
    io.write(block.js)

    io.close()
end